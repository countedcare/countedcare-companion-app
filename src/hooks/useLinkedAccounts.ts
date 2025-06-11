
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { LinkedAccount } from '@/types/FinancialAccount';
import useLocalStorage from '@/hooks/useLocalStorage';

export const useLinkedAccounts = () => {
  const [accounts, setAccounts] = useState<LinkedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Fallback to local storage when no authenticated user
  const [localAccounts, setLocalAccounts] = useLocalStorage<LinkedAccount[]>('countedcare-linked-accounts', []);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      if (user) {
        // Use Supabase when user is authenticated
        const { data, error } = await supabase
          .from('linked_accounts')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        const typedAccounts = (data || []).map(account => ({
          ...account,
          account_type: account.account_type as LinkedAccount['account_type']
        })) as LinkedAccount[];
        
        setAccounts(typedAccounts);
      } else {
        // Use local storage when no authenticated user
        setAccounts(localAccounts);
      }
    } catch (error) {
      console.error('Error fetching linked accounts:', error);
      if (user) {
        toast({
          title: "Error",
          description: "Failed to load linked accounts",
          variant: "destructive"
        });
      } else {
        // Fallback to local storage on error
        setAccounts(localAccounts);
      }
    } finally {
      setLoading(false);
    }
  };

  const addAccount = async (accountData: Omit<LinkedAccount, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      if (user) {
        // Use Supabase when user is authenticated
        const { data, error } = await supabase
          .from('linked_accounts')
          .insert({
            user_id: user.id,
            ...accountData
          })
          .select()
          .single();

        if (error) throw error;

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
      } else {
        // Use local storage when no authenticated user
        const newAccount: LinkedAccount = {
          id: crypto.randomUUID(),
          user_id: 'local-user',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...accountData
        };

        const updatedAccounts = [newAccount, ...localAccounts];
        setLocalAccounts(updatedAccounts);
        setAccounts(updatedAccounts);
        
        toast({
          title: "Account Added",
          description: `${accountData.account_name} has been linked successfully`
        });

        return newAccount;
      }
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
      if (user) {
        // Use Supabase when user is authenticated
        const { error } = await supabase
          .from('linked_accounts')
          .update({ is_active: false })
          .eq('id', accountId);

        if (error) throw error;

        setAccounts(prev => prev.filter(account => account.id !== accountId));
      } else {
        // Use local storage when no authenticated user
        const updatedAccounts = localAccounts.filter(account => account.id !== accountId);
        setLocalAccounts(updatedAccounts);
        setAccounts(updatedAccounts);
      }

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
  }, [user, localAccounts]);

  return {
    accounts,
    loading,
    addAccount,
    removeAccount,
    refetch: fetchAccounts
  };
};
