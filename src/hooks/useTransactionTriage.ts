import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface PlaidTransaction {
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
}

export interface TriageStats {
  reviewed_today: number;
  total_to_review: number;
  tips_shown: number;
}

export interface PrefillExpense {
  external_id: string;
  account_id: string;
  date: string;
  amount: number;
  is_refund: boolean;
  currency: string;
  merchant: string;
  memo: string;
  category_raw: any;
  payment_channel: string;
  status: string;
  location: any;
  counterparty_id: string;
  notes: string;
  category_guess: string;
  care_recipient_id?: string;
  is_medical_related?: boolean;
}

export const useTransactionTriage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [transactions, setTransactions] = useState<PlaidTransaction[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [triageStats, setTriageStats] = useState<TriageStats>({
    reviewed_today: 0,
    total_to_review: 0,
    tips_shown: 0
  });
  const [undoStack, setUndoStack] = useState<any[]>([]);

  // Fetch pending transactions
  const fetchTransactions = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_pending_triage_transactions', {
        p_user_id: user.id,
        p_limit: 50
      });

      if (error) throw error;
      
      setTransactions(data || []);
      setTriageStats(prev => ({ ...prev, total_to_review: data?.length || 0 }));
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

  // Fetch triage stats
  const fetchTriageStats = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_triage_stats')
        .select('reviewed_today, total_to_review, tips_shown')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setTriageStats(data);
      }
    } catch (error) {
      console.error('Error fetching triage stats:', error);
    }
  };

  // Map Plaid transaction to internal category
  const mapPlaidToInternalCategory = (merchant: string, category: any): string => {
    const merchantLower = merchant?.toLowerCase() || '';
    
    // Transportation services
    if (merchantLower.includes('uber') || merchantLower.includes('lyft') || 
        merchantLower.includes('taxi') || merchantLower.includes('rideshare')) {
      return 'Transportation';
    }
    
    // Pharmacy
    if (merchantLower.includes('pharmacy') || merchantLower.includes('cvs') || 
        merchantLower.includes('walgreens') || merchantLower.includes('rite aid')) {
      return 'Medical > Pharmacy';
    }
    
    // Medical facilities
    if (merchantLower.includes('medical') || merchantLower.includes('hospital') || 
        merchantLower.includes('clinic') || merchantLower.includes('doctor')) {
      return 'Medical > Healthcare Services';
    }
    
    // Default mapping based on category
    if (typeof category === 'string') {
      if (category.toLowerCase().includes('medical')) return 'Medical > Healthcare Services';
      if (category.toLowerCase().includes('transport')) return 'Transportation';
      if (category.toLowerCase().includes('pharmacy')) return 'Medical > Pharmacy';
    }
    
    return 'Other';
  };

  // Create prefilled expense from Plaid transaction
  const createPrefillExpense = (transaction: PlaidTransaction): PrefillExpense => {
    const isRefund = transaction.amount < 0;
    const categoryGuess = mapPlaidToInternalCategory(transaction.merchant_name || transaction.name, transaction.category);
    
    return {
      external_id: transaction.transaction_id,
      account_id: transaction.account_id,
      date: transaction.authorized_date || transaction.date,
      amount: Math.abs(transaction.amount),
      is_refund: isRefund,
      currency: transaction.iso_currency_code || 'USD',
      merchant: transaction.merchant_name || parseMerchantFromName(transaction.name),
      memo: transaction.name,
      category_raw: { 
        category: transaction.category,
        subcategory: transaction.subcategory,
        personal_finance_category: transaction.personal_finance_category
      },
      payment_channel: transaction.payment_channel || 'online',
      status: transaction.pending ? 'pending' : 'posted',
      location: transaction.location || {},
      counterparty_id: transaction.merchant_entity_id || transaction.merchant_name,
      notes: `Imported via Plaid on ${new Date().toISOString().slice(0, 10)}`,
      category_guess: categoryGuess,
      is_medical_related: categoryGuess.toLowerCase().includes('medical')
    };
  };

  // Parse merchant name from transaction description
  const parseMerchantFromName = (name: string): string => {
    // Remove common payment processor prefixes
    return name
      .replace(/^(SQ \*|TST\*|PAYPAL \*|SP \*)/i, '')
      .replace(/\s+\d{4}$/, '') // Remove trailing card numbers
      .trim();
  };

  // Handle keep decision
  const handleKeep = async (transaction: PlaidTransaction) => {
    if (!user) return null;

    try {
      // Record triage decision
      await supabase.from('transaction_triage').insert({
        user_id: user.id,
        transaction_id: transaction.transaction_id,
        decision: 'keep'
      });

      // Update stats
      await supabase.rpc('update_triage_stats', {
        p_user_id: user.id,
        p_decision: 'keep'
      });

      // Create prefilled expense
      const prefillExpense = createPrefillExpense(transaction);

      // Add to undo stack
      setUndoStack(prev => [...prev, { type: 'keep', transaction_id: transaction.transaction_id }]);

      // Move to next transaction
      moveToNext();

      // Update stats
      setTriageStats(prev => ({ ...prev, reviewed_today: prev.reviewed_today + 1 }));

      return prefillExpense;
    } catch (error) {
      console.error('Error handling keep:', error);
      toast({
        title: "Error",
        description: "Failed to save decision",
        variant: "destructive"
      });
      return null;
    }
  };

  // Handle skip decision
  const handleSkip = async (transaction: PlaidTransaction) => {
    if (!user) return;

    try {
      // Record triage decision
      await supabase.from('transaction_triage').insert({
        user_id: user.id,
        transaction_id: transaction.transaction_id,
        decision: 'skip'
      });

      // Update stats
      await supabase.rpc('update_triage_stats', {
        p_user_id: user.id,
        p_decision: 'skip'
      });

      // Add to undo stack
      setUndoStack(prev => [...prev, { type: 'skip', transaction_id: transaction.transaction_id }]);

      // Move to next transaction
      moveToNext();

      // Update stats
      setTriageStats(prev => ({ ...prev, reviewed_today: prev.reviewed_today + 1 }));

      toast({
        title: "Transaction skipped",
        description: "Transaction will not be saved as an expense",
      });
    } catch (error) {
      console.error('Error handling skip:', error);
      toast({
        title: "Error",
        description: "Failed to save decision",
        variant: "destructive"
      });
    }
  };

  // Handle undo
  const handleUndo = async () => {
    if (undoStack.length === 0) return;

    const lastAction = undoStack[undoStack.length - 1];
    
    try {
      // Remove triage decision
      await supabase
        .from('transaction_triage')
        .delete()
        .eq('user_id', user!.id)
        .eq('transaction_id', lastAction.transaction_id);

      // If it was a keep action, also remove the created expense
      if (lastAction.type === 'keep') {
        await supabase
          .from('expenses')
          .delete()
          .eq('user_id', user!.id)
          .eq('external_id', lastAction.transaction_id);
      }

      // Update undo stack
      setUndoStack(prev => prev.slice(0, -1));

      // Move back one transaction
      setCurrentIndex(prev => Math.max(0, prev - 1));

      // Update stats
      setTriageStats(prev => ({ ...prev, reviewed_today: Math.max(0, prev.reviewed_today - 1) }));

      toast({
        title: "Action undone",
        description: "Last decision has been reversed",
      });

      // Refresh transactions
      await fetchTransactions();
    } catch (error) {
      console.error('Error handling undo:', error);
      toast({
        title: "Error",
        description: "Failed to undo action",
        variant: "destructive"
      });
    }
  };

  // Move to next transaction
  const moveToNext = () => {
    setCurrentIndex(prev => prev + 1);
  };

  // Navigation functions
  const goToPrevious = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex(prev => Math.min(transactions.length - 1, prev + 1));
  };

  // Update tips shown count
  const incrementTipsShown = async () => {
    if (!user || triageStats.tips_shown >= 2) return;

    try {
      await supabase
        .from('user_triage_stats')
        .upsert({
          user_id: user.id,
          tips_shown: triageStats.tips_shown + 1
        });
      
      setTriageStats(prev => ({ ...prev, tips_shown: prev.tips_shown + 1 }));
    } catch (error) {
      console.error('Error updating tips shown:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTransactions();
      fetchTriageStats();
    }
  }, [user]);

  return {
    transactions,
    currentTransaction: transactions[currentIndex],
    currentIndex,
    loading,
    triageStats,
    hasUndo: undoStack.length > 0,
    isComplete: currentIndex >= transactions.length,
    handleKeep,
    handleSkip,
    handleUndo,
    fetchTransactions,
    incrementTipsShown,
    shouldShowTips: triageStats.tips_shown < 2,
    goToPrevious,
    goToNext
  };
};
