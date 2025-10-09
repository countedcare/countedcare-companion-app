import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Expense } from '@/types/User';

export interface ExpenseStats {
  total: number;
  deductible: number;
  reimbursed: number;
  manual: number;
  autoImported: number;
  pending: number;
  kept: number;
  skipped: number;
  thisMonth: number;
  thisYear: number;
  totalAmount: number;
  deductibleAmount: number;
  thisMonthAmount: number;
  thisYearAmount: number;
}

export function useExpenseData() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  // Centralized expense loading function
  const loadExpenses = async () => {
    if (!user) {
      setExpenses([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select(`
          *,
          synced_transactions!expenses_synced_transaction_id_fkey(
            description,
            merchant_name
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Standardized data transformation
      const transformedExpenses: Expense[] = (data || []).map(expense => {
        // Consistent description logic across all components
        let description = expense.description || expense.notes || '';
        
        if (expense.synced_transaction_id && expense.synced_transactions) {
          const syncedTransaction = Array.isArray(expense.synced_transactions) 
            ? expense.synced_transactions[0] 
            : expense.synced_transactions;
          
          if (syncedTransaction) {
            description = syncedTransaction.merchant_name || syncedTransaction.description || description;
          }
        }
        
        return {
          ...expense,
          careRecipientId: expense.care_recipient_id || '',
          receiptUrl: expense.receipt_url,
          description,
          triage_status: (expense.triage_status as 'pending' | 'kept' | 'skipped') || 'pending',
        };
      });
      
      setExpenses(transformedExpenses);
    } catch (error) {
      console.error('Error loading expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (): ExpenseStats => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Filter expenses by time periods
    const thisMonthExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
    });

    const thisYearExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getFullYear() === currentYear;
    });

    // Count-based stats
    const total = expenses.length;
    const deductible = expenses.filter(e => e.is_tax_deductible).length;
    const reimbursed = expenses.filter(e => e.is_reimbursed).length;
    const manual = expenses.filter(e => !e.synced_transaction_id).length;
    const autoImported = expenses.filter(e => e.synced_transaction_id).length;
    const pending = expenses.filter(e => e.triage_status === 'pending').length;
    const kept = expenses.filter(e => e.triage_status === 'kept').length;
    const skipped = expenses.filter(e => e.triage_status === 'skipped').length;
    const thisMonth = thisMonthExpenses.length;
    const thisYear = thisYearExpenses.length;

    // Amount-based stats - include both manual and converted transaction expenses
    const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    // Tax deductible amounts (includes converted transactions that are marked as deductible)
    const deductibleAmount = expenses
      .filter(e => e.is_tax_deductible)
      .reduce((sum, expense) => sum + expense.amount, 0);
    
    const thisMonthAmount = thisMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    const thisYearAmount = thisYearExpenses.reduce((sum, expense) => sum + expense.amount, 0);

    return {
      total,
      deductible,
      reimbursed,
      manual,
      autoImported,
      pending,
      kept,
      skipped,
      thisMonth,
      thisYear,
      totalAmount,
      deductibleAmount,
      thisMonthAmount,
      thisYearAmount, // All expenses for the year (consistent with thisMonthAmount)
    };
  };

  // Get recent expenses (for dashboard/home page)
  const getRecentExpenses = (limit: number = 3) => {
    return expenses.slice(0, limit);
  };

  // Get tax deduction progress data
  const getTaxProgress = (householdAGI: number = 75000) => {
    const threshold = householdAGI * 0.075;
    const stats = calculateStats();
    
    // Use this year's deductible expenses for tax calculation
    const currentYear = new Date().getFullYear();
    const thisYearDeductibleExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getFullYear() === currentYear && expense.is_tax_deductible;
    });
    
    const currentTracked = thisYearDeductibleExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const progressPercent = Math.min(100, (currentTracked / threshold) * 100);
    const unlockedDeductions = Math.max(0, currentTracked - threshold);

    return {
      threshold,
      currentTracked,
      progressPercent,
      unlockedDeductions,
    };
  };

  useEffect(() => {
    loadExpenses();
  }, [user]);

  const stats = calculateStats();

  return {
    expenses,
    loading,
    stats,
    reloadExpenses: loadExpenses,
    getRecentExpenses,
    getTaxProgress,
  };
}