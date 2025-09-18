import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Transaction {
  id: string;
  user_id: string;
  linked_account_id?: string;
  transaction_id: string;
  amount: number;
  date: string;
  description: string;
  merchant_name?: string;
  category?: string;
  is_potential_medical?: boolean;
  review_status: string;
  matched_expense_id?: string;
}

interface ExpenseFormData {
  date: Date;
  vendor: string;
  amount: number;
  category: string;
  notes?: string;
  is_tax_deductible: boolean;
}

interface UseTransactionReviewProps {
  sort?: string;
  filter?: string;
}

export function useTransactionReview({ sort = 'newest', filter = 'all' }: UseTransactionReviewProps = {}) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch transactions
  const {
    data: transactions = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['transactions', sort, filter],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');

      let query = supabase
        .from('synced_transactions')
        .select('*')
        .eq('user_id', user.id);

      // Apply filters
      if (filter === 'candidates') {
        query = query.eq('is_potential_medical', true).eq('review_status', 'pending');
      } else {
        query = query.eq('review_status', 'pending');
      }

      // Apply sorting
      switch (sort) {
        case 'amount':
          query = query.order('amount', { ascending: false });
          break;
        case 'merchant':
          query = query.order('merchant_name', { ascending: true });
          break;
        case 'newest':
        default:
          query = query.order('date', { ascending: false });
          break;
      }

      const { data, error } = await query.limit(100);
      
      if (error) throw error;
      return data as Transaction[];
    },
    enabled: !!user,
  });

  // Sync transactions mutation
  const syncTransactionsMutation = useMutation({
    mutationFn: async (days: number = 30) => {
      const { data, error } = await supabase.functions.invoke('plaid-sync-transactions', {
        body: { days }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: 'Sync complete',
        description: `${data.inserted} new transactions, ${data.updated} updated.`
      });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
    onError: (error) => {
      console.error('Sync error:', error);
      toast({
        title: 'Sync failed',
        description: 'Failed to sync transactions. Please try again.',
        variant: 'destructive'
      });
    }
  });

  // Skip transaction mutation
  const skipTransactionMutation = useMutation({
    mutationFn: async (transactionId: string) => {
      const { error } = await supabase
        .from('synced_transactions')
        .update({ review_status: 'skipped' })
        .eq('id', transactionId)
        .eq('user_id', user?.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
    onError: (error) => {
      console.error('Skip error:', error);
      toast({
        title: 'Error',
        description: 'Failed to skip transaction.',
        variant: 'destructive'
      });
    }
  });

  // Keep transaction mutation (create expense)
  const keepTransactionMutation = useMutation({
    mutationFn: async ({ transactionId, expenseData }: {
      transactionId: string;
      expenseData: ExpenseFormData;
    }) => {
      if (!user) throw new Error('Not authenticated');

      // Create the expense
      const { data: expense, error: expenseError } = await supabase
        .from('expenses')
        .insert({
          user_id: user.id,
          date: expenseData.date.toISOString().split('T')[0],
          vendor: expenseData.vendor,
          amount: expenseData.amount,
          category: expenseData.category,
          notes: expenseData.notes,
          is_tax_deductible: expenseData.is_tax_deductible,
          is_potentially_deductible: expenseData.is_tax_deductible,
          synced_transaction_id: transactionId
        })
        .select()
        .single();

      if (expenseError) throw expenseError;

      // Update the transaction
      const { error: updateError } = await supabase
        .from('synced_transactions')
        .update({
          review_status: 'kept',
          matched_expense_id: expense.id,
          is_confirmed_medical: true
        })
        .eq('id', transactionId)
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      return expense;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
    onError: (error) => {
      console.error('Keep error:', error);
      toast({
        title: 'Error',
        description: 'Failed to create expense.',
        variant: 'destructive'
      });
    }
  });

  // Helper functions
  const syncTransactions = useCallback((days?: number) => {
    syncTransactionsMutation.mutate(days);
  }, [syncTransactionsMutation]);

  const skipTransaction = useCallback((transaction: Transaction) => {
    skipTransactionMutation.mutate(transaction.id);
  }, [skipTransactionMutation]);

  const keepTransaction = useCallback(async (data: ExpenseFormData & { transactionId: string }) => {
    const { transactionId, ...expenseData } = data;
    return keepTransactionMutation.mutateAsync({ transactionId, expenseData });
  }, [keepTransactionMutation]);

  // Calculate stats
  const stats = {
    totalPending: transactions.filter(tx => tx.review_status === 'pending').length,
    totalCandidates: transactions.filter(tx => tx.is_potential_medical && tx.review_status === 'pending').length
  };

  return {
    transactions,
    isLoading,
    error,
    stats,
    syncTransactions,
    skipTransaction,
    keepTransaction,
    refetch,
    isSyncing: syncTransactionsMutation.isPending,
    isSkipping: skipTransactionMutation.isPending,
    isKeeping: keepTransactionMutation.isPending
  };
}
