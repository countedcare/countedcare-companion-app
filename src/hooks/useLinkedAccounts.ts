
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { LinkedAccount } from '@/types/FinancialAccount';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useLinkedAccounts = () => {
  const [accounts, setAccounts] = useState<LinkedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

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
        console.error('Error fetching linked accounts:', error);
        toast({
          title: "Error",
          description: "Failed to fetch linked accounts",
          variant: "destructive"
        });
        return;
      }

      setAccounts(data || []);
    } catch (error) {
      console.error('Error fetching linked accounts:', error);
      toast({
        title: "Error",
        description: "Failed to fetch linked accounts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addAccount = async (accountData: Omit<LinkedAccount, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to add accounts",
        variant: "destructive"
      });
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
        console.error('Error adding account:', error);
        toast({
          title: "Error",
          description: "Failed to add account",
          variant: "destructive"
        });
        throw error;
      }

      toast({
        title: "Account Added",
        description: `${accountData.account_name} has been linked successfully`
      });

      await fetchAccounts();
      return data;
    } catch (error) {
      console.error('Error adding account:', error);
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
        console.error('Error removing account:', error);
        toast({
          title: "Error",
          description: "Failed to remove account",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Account Removed",
        description: "Account has been unlinked successfully"
      });

      await fetchAccounts();
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
