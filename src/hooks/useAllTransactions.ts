import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface TransactionWithStatus {
  transaction_id: string;
  account_id: string;
  amount: number;
  iso_currency_code: string;
  date: string;
  authorized_date: string;
  name: string;
  merchant_name: string;
  category: string;
  subcategory: string;
  payment_channel: string;
  location: any;
  pending: boolean;
  merchant_entity_id: string;
  personal_finance_category: any;
  triage_decision: string | null;
  triage_created_at: string | null;
  expense_id: string | null;
  expense_category: string | null;
  is_potential_medical: boolean;
  is_confirmed_medical: boolean;
}

export interface TransactionFilters {
  filter: 'all' | 'pending' | 'kept' | 'skipped' | 'medical';
  limit: number;
  offset: number;
}

export const useAllTransactions = (filters: TransactionFilters) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [transactions, setTransactions] = useState<TransactionWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  const fetchTransactions = async (reset = false) => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase.rpc('get_all_user_transactions', {
        p_user_id: user.id,
        p_limit: filters.limit,
        p_offset: reset ? 0 : filters.offset,
        p_filter: filters.filter
      });

      if (error) throw error;
      
      if (reset) {
        setTransactions(data || []);
      } else {
        setTransactions(prev => [...prev, ...(data || [])]);
      }
      
      setHasMore((data || []).length === filters.limit);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast({
        title: "Error",
        description: "Failed to load transactions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Update triage decision
  const updateTriageDecision = async (transactionId: string, decision: 'keep' | 'skip') => {
    if (!user) return;

    try {
      // Remove existing triage decision if any
      await supabase
        .from('transaction_triage')
        .delete()
        .eq('user_id', user.id)
        .eq('transaction_id', transactionId);

      // Insert new decision
      const { error } = await supabase
        .from('transaction_triage')
        .insert({
          user_id: user.id,
          transaction_id: transactionId,
          decision
        });

      if (error) throw error;

      // Update local state
      setTransactions(prev => 
        prev.map(txn => 
          txn.transaction_id === transactionId 
            ? { ...txn, triage_decision: decision, triage_created_at: new Date().toISOString() }
            : txn
        )
      );

      toast({
        title: decision === 'keep' ? "Transaction kept" : "Transaction skipped",
        description: `You can always change this decision later`,
      });
    } catch (error) {
      console.error('Error updating triage decision:', error);
      toast({
        title: "Error",
        description: "Failed to update transaction",
        variant: "destructive"
      });
    }
  };

  // Navigate to expense form with prefill
  const editAsExpense = (transaction: TransactionWithStatus) => {
    const searchParams = new URLSearchParams({
      prefill: 'true',
      external_id: transaction.transaction_id,
      account_id: transaction.account_id,
      date: transaction.date,
      amount: Math.abs(transaction.amount).toString(),
      currency: transaction.iso_currency_code,
      merchant: transaction.merchant_name || transaction.name,
      memo: transaction.name,
      category_guess: transaction.category || 'Other',
      payment_channel: transaction.payment_channel,
      status: transaction.pending ? 'pending' : 'posted',
      is_refund: (transaction.amount < 0).toString(),
      is_medical_related: (transaction.is_potential_medical || transaction.is_confirmed_medical).toString()
    });
    
    window.location.href = `/expenses/new?${searchParams.toString()}`;
  };

  useEffect(() => {
    if (user) {
      fetchTransactions(true);
    }
  }, [user, filters.filter]);

  return {
    transactions,
    loading,
    hasMore,
    fetchTransactions,
    updateTriageDecision,
    editAsExpense,
    loadMore: () => fetchTransactions(false)
  };
};