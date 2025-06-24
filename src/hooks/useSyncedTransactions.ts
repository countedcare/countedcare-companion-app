
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { SyncedTransaction } from '@/types/FinancialAccount';
import useLocalStorage from '@/hooks/useLocalStorage';

export const useSyncedTransactions = () => {
  const [transactions, setTransactions] = useState<SyncedTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  // Use local storage for data persistence
  const [localTransactions, setLocalTransactions] = useLocalStorage<SyncedTransaction[]>('countedcare-synced-transactions', []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      // Always use local storage since authentication is removed
      setTransactions(localTransactions);
    } catch (error) {
      console.error('Error fetching synced transactions:', error);
      // Fallback to local storage on error
      setTransactions(localTransactions);
    } finally {
      setLoading(false);
    }
  };

  const syncAccountTransactions = async (accountId: string) => {
    try {
      toast({
        title: "Error",
        description: "Transaction syncing requires authentication. This feature is currently disabled.",
        variant: "destructive"
      });
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
      // Always use local storage since authentication is removed
      const updatedTransactions = localTransactions.map(t => 
        t.id === transactionId ? { ...t, ...updates } : t
      );
      setLocalTransactions(updatedTransactions);
      setTransactions(updatedTransactions);
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
      // Always use local storage since authentication is removed
      const updatedTransactions = localTransactions.filter(t => t.id !== transactionId);
      setLocalTransactions(updatedTransactions);
      setTransactions(updatedTransactions);
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
  }, [localTransactions]);

  return {
    transactions,
    loading,
    syncAccountTransactions,
    updateTransaction,
    deleteTransaction,
    refetch: fetchTransactions
  };
};
