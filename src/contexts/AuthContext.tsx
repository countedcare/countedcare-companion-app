
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type MFAState = "none" | "verify" | "enroll";

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
      // Feature detection: check if MFA is available
      if (!supabase.auth.mfa || typeof supabase.auth.mfa.getAuthenticatorAssuranceLevel !== 'function') {
        console.log('MFA not available in this Supabase instance, defaulting to none');
        setMfaState("none");
        return;
      }

      // Get current AAL level
      const { data: aalData, error: aalError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aalError) {
        console.warn('MFA AAL check failed, assuming MFA not enabled:', aalError.message);
        setMfaState("none");
        return;
      }

      const currentLevel = aalData?.currentLevel;

      // Check enrolled factors
      const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors();
      if (factorsError) {
        console.warn('MFA factors check failed, assuming MFA not enabled:', factorsError.message);
        setMfaState("none");
        return;
      }

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
      console.warn('MFA feature detection failed, defaulting to none:', error);
      setMfaState("none");
    }
  };

  useEffect(() => {
    let subscription: any = null;
    let isInitialized = false;
    
    // Set up auth state listener first
    const setupAuthListener = () => {
      const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log('Auth state changed:', event, session?.user?.email || 'no user');
          const currentUser = session?.user ?? null;
          setUser(currentUser);
          
          // Check MFA state after setting user
          await checkMFAState(currentUser);
          
          // Always ensure loading is false after auth state change
          if (isInitialized) {
            setLoading(false);
          }
        }
      );
      subscription = authSubscription;
    };

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
        // Mark as initialized and set loading to false
        isInitialized = true;
        setLoading(false);
        console.log('AuthProvider initialization complete');
      }
    };

    setupAuthListener();
    getInitialSession();

    return () => {
      try {
        if (subscription && typeof subscription.unsubscribe === 'function') {
          subscription.unsubscribe();
        }
      } catch (error) {
        console.warn('Error cleaning up auth subscription:', error);
      }
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    loading,
    mfaState,
    signOut
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
