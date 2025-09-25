
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { LinkedAccount } from '@/types/FinancialAccount';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useErrorHandler } from './useErrorHandler';

export const useLinkedAccounts = () => {
  const [accounts, setAccounts] = useState<LinkedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  const { handleError } = useErrorHandler();

  const fetchAccounts = async () => {
    if (!user) {
      setAccounts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('linked_accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        handleError(error, "Failed to fetch linked accounts");
        return;
      }

      // Cast the account_type to the correct union type
      const typedAccounts = (data || []).map(account => ({
        ...account,
        account_type: account.account_type as LinkedAccount['account_type']
      }));

      setAccounts(typedAccounts);
    } catch (error) {
      handleError(error, "Failed to fetch linked accounts");
    } finally {
      setLoading(false);
    }
  };

  const addAccount = async (accountData: Omit<LinkedAccount, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) {
      handleError(new Error('Authentication required'), "You must be logged in to add accounts");
      return;
    }

    try {
      const { data, error } = await supabase
        .from('linked_accounts')
        .insert([{
          ...accountData,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) {
        handleError(error, "Failed to add account");
        throw error;
      }

      toast({
        title: "Account Added",
        description: `${accountData.account_name} has been linked successfully`
      });

      await fetchAccounts();
      return data;
    } catch (error) {
      handleError(error, "Failed to add account");
      throw error;
    }
  };

  const removeAccount = async (accountId: string) => {
    try {
      const { error } = await supabase
        .from('linked_accounts')
        .delete()
        .eq('id', accountId);

      if (error) {
        handleError(error, "Failed to remove account");
        return;
      }

      toast({
        title: "Account Removed",
        description: "Account has been unlinked successfully"
      });

      await fetchAccounts();
    } catch (error) {
      handleError(error, "Failed to remove account");
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [user]);

  return {
    accounts,
    loading,
    addAccount,
    removeAccount,
    refetch: fetchAccounts
  };
};
