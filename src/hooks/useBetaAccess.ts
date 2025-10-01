import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface BetaAccessStatus {
  hasBetaAccess: boolean;
  paymentDate?: string;
  loading: boolean;
  error?: string;
  freeTrialExpenses?: number;
  freeTrialLimit?: number;
  isPaid?: boolean;
}

export function useBetaAccess() {
  const { user, session } = useAuth();
  const [status, setStatus] = useState<BetaAccessStatus>({
    hasBetaAccess: false,
    loading: true
  });

  const checkBetaAccess = async () => {
    if (!user) {
      setStatus({ hasBetaAccess: false, loading: false });
      return;
    }

    try {
      setStatus(prev => ({ ...prev, loading: true }));
      
      // Refresh session to get valid token
      const { data: { session: freshSession }, error: sessionError } = await supabase.auth.refreshSession();
      
      if (sessionError || !freshSession) {
        console.error('Session refresh failed:', sessionError);
        setStatus({
          hasBetaAccess: false,
          loading: false,
          error: 'Session expired. Please sign in again.'
        });
        return;
      }
      
      const { data, error } = await supabase.functions.invoke('check-beta-access', {
        headers: {
          Authorization: `Bearer ${freshSession.access_token}`,
        },
      });

      if (error) throw error;

      setStatus({
        hasBetaAccess: data.hasBetaAccess || false,
        paymentDate: data.paymentDate,
        freeTrialExpenses: data.freeTrialExpenses,
        freeTrialLimit: data.freeTrialLimit,
        isPaid: data.isPaid,
        loading: false
      });
    } catch (error) {
      console.error('Error checking beta access:', error);
      setStatus({
        hasBetaAccess: false,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to check beta access'
      });
    }
  };

  useEffect(() => {
    checkBetaAccess();
  }, [user, session]);

  return {
    ...status,
    refreshBetaAccess: checkBetaAccess
  };
}