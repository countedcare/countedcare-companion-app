
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type MFAState = "none" | "verify" | "enroll";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  mfaState: MFAState;
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
  const [loading, setLoading] = useState(true);
  const [mfaState, setMfaState] = useState<MFAState>("none");

  const checkMFAState = async (currentUser: User | null) => {
    if (!currentUser) {
      setMfaState("none");
      return;
    }

    try {
      // Get current AAL level
      const { data: aalData, error: aalError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aalError) throw aalError;

      const currentLevel = aalData?.currentLevel;

      // Check enrolled factors
      const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors();
      if (factorsError) throw factorsError;

      const enrolledFactors = factorsData?.totp?.filter(factor => factor.status === 'verified') || [];

      // Apply the rules from the spec
      if (currentLevel === "aal2") {
        setMfaState("none");
      } else if (enrolledFactors.length > 0) {
        setMfaState("verify");
      } else {
        setMfaState("enroll");
      }
    } catch (error) {
      console.error('Error checking MFA state:', error);
      setMfaState("enroll"); // Default to enroll on error
    }
  };

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email || 'no user');
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        
        // Check MFA state after setting user
        await checkMFAState(currentUser);
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
          const currentUser = session?.user ?? null;
          setUser(currentUser);
          await checkMFAState(currentUser);
        }
      } catch (error) {
        console.error('Unexpected error getting session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const value = {
    user,
    loading,
    mfaState
  };

  console.log('AuthProvider render:', { 
    hasUser: !!user, 
    loading,
    mfaState
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
