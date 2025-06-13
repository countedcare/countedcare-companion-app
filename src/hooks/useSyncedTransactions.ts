
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { SyncedTransaction } from '@/types/FinancialAccount';
import useLocalStorage from '@/hooks/useLocalStorage';

export const useSyncedTransactions = () => {
  const [transactions, setTransactions] = useState<SyncedTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Fallback to local storage when no authenticated user
  const [localTransactions, setLocalTransactions] = useLocalStorage<SyncedTransaction[]>('countedcare-synced-transactions', []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      if (user) {
        // Use Supabase when user is authenticated
        const { data, error } = await supabase
          .from('synced_transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false });

        if (error) throw error;
        
        setTransactions(data || []);
      } else {
        // Use local storage when no authenticated user
        setTransactions(localTransactions);
      }
    } catch (error) {
      console.error('Error fetching synced transactions:', error);
      if (user) {
        toast({
          title: "Error",
          description: "Failed to load synced transactions",
          variant: "destructive"
        });
      } else {
        // Fallback to local storage on error
        setTransactions(localTransactions);
      }
    } finally {
      setLoading(false);
    }
  };

  const syncAccountTransactions = async (accountId: string) => {
    try {
      if (!user) {
        toast({
          title: "Error",
          description: "Please sign in to sync transactions",
          variant: "destructive"
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('stripe-financial-connections', {
        body: {
          action: 'sync_transactions',
          accountId
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Synced ${data.synced_count} new transactions`
      });

      // Refresh transactions
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
      if (user) {
        const { error } = await supabase
          .from('synced_transactions')
          .update(updates)
          .eq('id', transactionId);

        if (error) throw error;

        setTransactions(prev => 
          prev.map(t => t.id === transactionId ? { ...t, ...updates } : t)
        );
      } else {
        const updatedTransactions = localTransactions.map(t => 
          t.id === transactionId ? { ...t, ...updates } : t
        );
        setLocalTransactions(updatedTransactions);
        setTransactions(updatedTransactions);
      }
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
      if (user) {
        const { error } = await supabase
          .from('synced_transactions')
          .delete()
          .eq('id', transactionId);

        if (error) throw error;

        setTransactions(prev => prev.filter(t => t.id !== transactionId));
      } else {
        const updatedTransactions = localTransactions.filter(t => t.id !== transactionId);
        setLocalTransactions(updatedTransactions);
        setTransactions(updatedTransactions);
      }
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
  }, [user, localTransactions]);

  return {
    transactions,
    loading,
    syncAccountTransactions,
    updateTransaction,
    deleteTransaction,
    refetch: fetchTransactions
  };
};
