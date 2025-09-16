import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type MFAState = 'none' | 'verify' | 'enroll';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  mfaState: MFAState;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

// Small helper: safely check if MFA APIs exist on this client
const hasMFA = () => {
  // Some older versions or projects won’t have auth.mfa at all
  // @ts-expect-error: runtime feature detection
  const mfa = supabase?.auth?.mfa;
  return Boolean(
    mfa &&
      typeof mfa.getAuthenticatorAssuranceLevel === 'function' &&
      typeof mfa.listFactors === 'function'
  );
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mfaState, setMfaState] = useState<MFAState>('none');

  const computeMFAState = async (currentUser: User | null) => {
    // If no user, no MFA needed
    if (!currentUser) {
      setMfaState('none');
      return;
    }

    // If MFA APIs aren’t available, don’t call them—default to none
    if (!hasMFA()) {
      console.warn('[AuthProvider] MFA APIs not available on this supabase client. Skipping MFA checks.');
      setMfaState('none');
      return;
    }

    try {
      // @ts-expect-error runtime availability checked above
      const { data: aalData, error: aalError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aalError) throw aalError;

      const currentLevel = aalData?.currentLevel; // 'aal1' | 'aal2' | 'aal3' | 'none'

      // @ts-expect-error runtime availability checked above
      const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors();
      if (factorsError) throw factorsError;

      const enrolledTotp =
        factorsData?.totp?.filter((f: { status?: string }) => f.status === 'verified') ?? [];

      // Logic:
      // - If already authenticated at aal2 or higher → no action
      // - Else if you have verified factors but not at aal2 → should verify
      // - Else → enroll
      if (currentLevel === 'aal2' || currentLevel === 'aal3') {
        setMfaState('none');
      } else if (enrolledTotp.length > 0) {
        setMfaState('verify');
      } else {
        setMfaState('enroll');
      }
    } catch (err) {
      console.error('[AuthProvider] Error while checking MFA state:', err);
      // Be conservative but non-blocking: allow app to load and prompt enroll later
      setMfaState('none');
    }
  };

  useEffect(() => {
    let isMounted = true;

    // 1) Subscribe to auth state changes
    const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const nextUser = session?.user ?? null;
      if (!isMounted) return;
      setUser(nextUser);
      await computeMFAState(nextUser);
      if (!isMounted) return;
      setLoading(false);
      console.log('[Au]()
