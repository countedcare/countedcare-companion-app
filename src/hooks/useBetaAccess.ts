import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface BetaAccessStatus {
  hasBetaAccess: boolean;
  paymentDate?: string;
  loading: boolean;
  error?: string;
}

export function useBetaAccess() {
  const { user, session } = useAuth();
  const [status, setStatus] = useState<BetaAccessStatus>({
    hasBetaAccess: false,
    loading: true
  });

  const checkBetaAccess = async () => {
    if (!user || !session) {
      setStatus({ hasBetaAccess: false, loading: false });
      return;
    }

    try {
      setStatus(prev => ({ ...prev, loading: true }));
      
      const { data, error } = await supabase.functions.invoke('check-beta-access', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      setStatus({
        hasBetaAccess: data.hasBetaAccess || false,
        paymentDate: data.paymentDate,
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