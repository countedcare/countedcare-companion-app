
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { LinkedAccount } from '@/types/FinancialAccount';

export const useLinkedAccounts = () => {
  const [accounts, setAccounts] = useState<LinkedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchAccounts = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('linked_accounts')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Type assertion to ensure the data matches our interface
      const typedAccounts = (data || []).map(account => ({
        ...account,
        account_type: account.account_type as LinkedAccount['account_type']
      })) as LinkedAccount[];
      
      setAccounts(typedAccounts);
    } catch (error) {
      console.error('Error fetching linked accounts:', error);
      toast({
        title: "Error",
        description: "Failed to load linked accounts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addAccount = async (accountData: Omit<LinkedAccount, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('linked_accounts')
        .insert({
          user_id: user.id,
          ...accountData
        })
        .select()
        .single();

      if (error) throw error;

      // Type assertion for the returned data
      const typedAccount = {
        ...data,
        account_type: data.account_type as LinkedAccount['account_type']
      } as LinkedAccount;

      setAccounts(prev => [typedAccount, ...prev]);
      toast({
        title: "Account Added",
        description: `${accountData.account_name} has been linked successfully`
      });

      return typedAccount;
    } catch (error) {
      console.error('Error adding account:', error);
      toast({
        title: "Error",
        description: "Failed to link account",
        variant: "destructive"
      });
      throw error;
    }
  };

  const removeAccount = async (accountId: string) => {
    try {
      const { error } = await supabase
        .from('linked_accounts')
        .update({ is_active: false })
        .eq('id', accountId);

      if (error) throw error;

      setAccounts(prev => prev.filter(account => account.id !== accountId));
      toast({
        title: "Account Removed",
        description: "Account has been unlinked successfully"
      });
    } catch (error) {
      console.error('Error removing account:', error);
      toast({
        title: "Error",
        description: "Failed to remove account",
        variant: "destructive"
      });
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
