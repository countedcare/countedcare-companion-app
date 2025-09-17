
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { SyncedTransaction } from '@/types/FinancialAccount';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useSyncedTransactions = () => {
  const [transactions, setTransactions] = useState<SyncedTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchTransactions = async () => {
    if (!user) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('synced_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching synced transactions:', error);
        toast({
          title: "Error",
          description: "Failed to fetch transactions",
          variant: "destructive"
        });
        return;
      }

      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching synced transactions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch transactions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const syncAccountTransactions = async (accountId: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to sync transactions",
        variant: "destructive"
      });
      return;
    }

    try {
      toast({
        title: "Syncing Transactions",
        description: "Fetching your latest transactions..."
      });

      const { data, error } = await supabase.functions.invoke('plaid-financial-connections', {
        body: {
          action: 'sync_transactions',
          account_id: accountId,
          user_id: user.id
        }
      });

      if (error) {
        console.error('Error syncing transactions:', error);
        toast({
          title: "Error",
          description: "Failed to sync transactions",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success",
        description: `Synced ${data?.synced_count || 0} new transactions`
      });

      await fetchTransactions();
    } catch (error) {
      console.error('Error syncing transactions:', error);
      toast({
        title: "Error",
        description: "Failed to sync transactions",
        variant: "destructive"
      });
    }
  };

  const updateTransaction = async (transactionId: string, updates: Partial<SyncedTransaction>) => {
    try {
      const { error } = await supabase
        .from('synced_transactions')
        .update(updates)
        .eq('id', transactionId);

      if (error) {
        console.error('Error updating transaction:', error);
        toast({
          title: "Error",
          description: "Failed to update transaction",
          variant: "destructive"
        });
        return;
      }

      await fetchTransactions();
    } catch (error) {
      console.error('Error updating transaction:', error);
      toast({
        title: "Error",
        description: "Failed to update transaction",
        variant: "destructive"
      });
    }
  };

  const deleteTransaction = async (transactionId: string) => {
    try {
      const { error } = await supabase
        .from('synced_transactions')
        .delete()
        .eq('id', transactionId);

      if (error) {
        console.error('Error deleting transaction:', error);
        toast({
          title: "Error",
          description: "Failed to delete transaction",
          variant: "destructive"
        });
        return;
      }

      await fetchTransactions();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast({
        title: "Error",
        description: "Failed to delete transaction",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [user]);

  return {
    transactions,
    loading,
    syncAccountTransactions,
    updateTransaction,
    deleteTransaction,
    refetch: fetchTransactions
  };
};
