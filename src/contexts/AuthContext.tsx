import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { useAutoLogout } from "@/hooks/useAutoLogout";

const AutoLogoutHandler = ({ user, signOut }: { user: User | null; signOut: () => Promise<void> }) => {
  useAutoLogout({ user, signOut });
  return null;
};

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;              // only true during initial bootstrap
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    // During initial render or React StrictMode, context might not be ready
    console.warn("useAuth called outside AuthProvider - returning null context");
    return { user: null, session: null, loading: true, signOut: async () => {} };
  }
  return ctx;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Stabilized AuthProvider
 * - Single init path sets loading=false exactly once
 * - Auth listener updates user/session but NOT loading
 * - Memoized context value to prevent consumer rerenders on every state change
 * - Guards against React 18 StrictMode double effect
 */
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const mountedRef = useRef(false);
  const unsubRef = useRef<(() => void) | null>(null);
  const initializedRef = useRef(false); // ensure we don't re-run init in StrictMode

  useEffect(() => {
    if (initializedRef.current) return; // StrictMode guard
    initializedRef.current = true;
    mountedRef.current = true;

    // 1) Initial session fetch
    const bootstrap = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) console.error("supabase.auth.getSession error:", error);
        if (!mountedRef.current) return;
        setSession(data?.session ?? null);
        setUser(data?.session?.user ?? null);
      } catch (e) {
        console.error("Unexpected getSession error:", e);
      } finally {
        if (mountedRef.current) setLoading(false); // <-- set once after init
      }
    };

    // 2) Subscribe to auth changes (don't toggle loading here)
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      if (!mountedRef.current) return;
      setSession(s);
      setUser(s?.user ?? null);
    });

    unsubRef.current = () => sub.subscription.unsubscribe();

    bootstrap();

    return () => {
      mountedRef.current = false;
      try {
        unsubRef.current?.();
      } catch {}
      unsubRef.current = null;
    };
  }, []);

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) console.error("signOut error:", error);
      // user/session will clear via listener
    } catch (e) {
      console.error("Unexpected signOut error:", e);
    }
  };

  // Memoize so consumers (tabs/pages) don't re-render unnecessarily
  const value = useMemo<AuthContextType>(
    () => ({ user, session, loading, signOut }),
    [user, session, loading]
  );

  return (
    <AuthContext.Provider value={value}>
      <AutoLogoutHandler user={user} signOut={signOut} />
      {children}
    </AuthContext.Provider>
  );
};
