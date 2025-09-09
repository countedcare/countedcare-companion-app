
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  mfaRequired: boolean;
  hasMFA: boolean;
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

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [mfaRequired, setMfaRequired] = useState(false);
  const [hasMFA, setHasMFA] = useState(false);

  // Check MFA status when user changes
  useEffect(() => {
    const checkMFAStatus = async () => {
      if (!user) {
        setMfaRequired(false);
        setHasMFA(false);
        return;
      }

      try {
        const { data, error } = await supabase.auth.mfa.listFactors();
        if (error) throw error;
        
        const hasEnabledMFA = data?.totp?.some(factor => factor.status === 'verified') || false;
        setHasMFA(hasEnabledMFA);
        setMfaRequired(!hasEnabledMFA); // Require MFA if not enabled
      } catch (error) {
        console.error('Error checking MFA status:', error);
        setMfaRequired(true); // Default to requiring MFA on error
        setHasMFA(false);
      }
    };

    checkMFAStatus();
  }, [user]);

  useEffect(() => {
    console.log('AuthProvider: Setting up auth state listener');
    
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email || 'no user');
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Then check for existing session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting initial session:', error);
        } else {
          console.log('Initial session check:', session?.user?.email || 'no session');
          setSession(session);
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.error('Unexpected error getting session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    return () => {
      console.log('AuthProvider: Cleaning up auth state listener');
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      console.log('Signing out user');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
      } else {
        console.log('User signed out successfully');
      }
    } catch (error) {
      console.error('Unexpected error signing out:', error);
    }
  };

  const value = {
    user,
    session,
    loading,
    mfaRequired,
    hasMFA,
    signOut
  };

  console.log('AuthProvider render:', { 
    hasUser: !!user, 
    hasSession: !!session, 
    loading,
    mfaRequired,
    hasMFA
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
