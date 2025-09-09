
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, Search, BarChart3, CreditCard } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import Layout from '@/components/Layout';
import useLocalStorage from '@/hooks/useLocalStorage';
import { Expense, CareRecipient } from '@/types/User';
import { SyncedTransaction } from '@/types/FinancialAccount';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import ExpenseInsights from '@/components/expenses/ExpenseInsights';
import ExpenseRecommendations from '@/components/expenses/ExpenseRecommendations';
import ExpenseTable from '@/components/expenses/ExpenseTable';
import AutoImportedTransactions from '@/components/expenses/AutoImportedTransactions';
import TaxDeductionProgress from '@/components/expenses/TaxDeductionProgress';
import EnhancedSmartFilters from '@/components/expenses/EnhancedSmartFilters';
import { useSyncedTransactions } from '@/hooks/useSyncedTransactions';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const Expenses = () => {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [recipients] = useLocalStorage<CareRecipient[]>('countedcare-recipients', []);
  const [loading, setLoading] = useState(true);
  const { transactions: syncedTransactions, updateTransaction, deleteTransaction } = useSyncedTransactions();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterRecipient, setFilterRecipient] = useState('');
  const [filterDeductible, setFilterDeductible] = useState('');
  const [filterSource, setFilterSource] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  // Load expenses from Supabase (same as Dashboard)
  const loadExpenses = async () => {
    if (!authUser) return;
    
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', authUser.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform database format to local format
      const transformedExpenses: Expense[] = (data || []).map(expense => ({
        ...expense,
        careRecipientId: expense.care_recipient_id || '',
        receiptUrl: expense.receipt_url,
        description: expense.description || expense.notes || '',
      }));
      
      setExpenses(transformedExpenses);
    } catch (error) {
      console.error('Error loading expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, [authUser]);
  
  // Filter only unconfirmed potential medical transactions for the review section
  const unconfirmedTransactions = syncedTransactions.filter(
    transaction => transaction.is_potential_medical && !transaction.is_confirmed_medical
  );
  
  // Filter expenses
  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = !searchTerm || 
      expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      expense.category.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesCategory = !filterCategory || filterCategory === 'all-categories' || expense.category === filterCategory;
    const matchesRecipient = !filterRecipient || filterRecipient === 'all-recipients' || expense.careRecipientId === filterRecipient;
    
    const matchesDeductible = !filterDeductible || filterDeductible === 'all' || 
      (filterDeductible === 'deductible' && expense.is_tax_deductible) ||
      (filterDeductible === 'non-deductible' && !expense.is_tax_deductible);
    
    const matchesSource = !filterSource || filterSource === 'all-sources' ||
      (filterSource === 'manual' && !expense.synced_transaction_id) ||
      (filterSource === 'auto-imported' && expense.synced_transaction_id);
    
    // Date range filter
    let matchesDateRange = true;
    if (dateRange && dateRange.from) {
      const expenseDate = new Date(expense.date);
      
      if (dateRange.to) {
        matchesDateRange = expenseDate >= dateRange.from && expenseDate <= dateRange.to;
      } else {
        matchesDateRange = expenseDate.toDateString() === dateRange.from.toDateString();
      }
    }
    
    return matchesSearch && matchesCategory && matchesRecipient && matchesDeductible && matchesSource && matchesDateRange;
  });
  
  // Sort expenses by date (newest first)
  const sortedExpenses = [...filteredExpenses].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const handleClearFilters = () => {
    setFilterCategory('');
    setFilterRecipient('');
    setFilterDeductible('');
    setFilterSource('');
    setDateRange(undefined);
    setSearchTerm('');
  };

  const handleConfirmTransaction = async (transactionId: string, expenseData: any) => {
    if (!authUser) return;
    
    try {
      // Save to Supabase instead of localStorage
      const { data, error } = await supabase
        .from('expenses')
        .insert([{
          ...expenseData,
          user_id: authUser.id,
          synced_transaction_id: transactionId,
          care_recipient_id: expenseData.careRecipientId || null,
          receipt_url: expenseData.receiptUrl || null,
          description: expenseData.description || expenseData.notes || null,
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      // Mark transaction as confirmed medical
      updateTransaction(transactionId, { 
        is_confirmed_medical: true, 
        expense_id: data.id 
      });
      
      // Reload expenses to get updated data
      loadExpenses();
    } catch (error) {
      console.error('Error saving expense:', error);
    }
  };

  const handleExcludeTransaction = (transactionId: string) => {
    deleteTransaction(transactionId);
  };

  const handleEditTransaction = (transactionId: string, updates: Partial<SyncedTransaction>) => {
    updateTransaction(transactionId, updates);
  };
  
  if (loading) {
    return (
      <Layout>
        <div className="container-padding py-6 flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-padding py-3 sm:py-6">
        {/* Mobile-optimized header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 space-y-3 sm:space-y-0">
          <div>
            <h1 className="mobile-heading font-heading">Track & Understand</h1>
            <p className="text-muted-foreground text-xs sm:text-sm mt-1">
              Monitor your caregiving expenses and discover opportunities to save
            </p>
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <Button variant="outline" onClick={() => navigate('/linked-accounts')} className="mobile-button">
              <CreditCard className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Link Bank Account</span>
              <span className="sm:hidden">Link Bank</span>
            </Button>
            <Button onClick={() => navigate('/expenses/new')} className="bg-primary mobile-button">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Expense
            </Button>
          </div>
        </div>
        
        {/* Auto-imported transactions review */}
        <AutoImportedTransactions
          transactions={unconfirmedTransactions}
          onConfirmTransaction={handleConfirmTransaction}
          onExcludeTransaction={handleExcludeTransaction}
          onEditTransaction={handleEditTransaction}
        />
        
        {/* Tax deduction progress */}
        <TaxDeductionProgress expenses={expenses} />
        
        {/* Insights Overview */}
        <ExpenseInsights expenses={expenses} />
        
        {/* Recommendations */}
        <ExpenseRecommendations expenses={expenses} recipients={recipients} />
        
        <Tabs defaultValue="list" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-2 h-9 sm:h-10">
            <TabsTrigger value="list" className="text-xs sm:text-sm">Expense List</TabsTrigger>
            <TabsTrigger value="insights" className="text-xs sm:text-sm">
              <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Deep Insights</span>
              <span className="sm:hidden">Insights</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="list" className="space-y-4 sm:space-y-6">
            {/* Mobile-optimized search and filters */}
            <div className="space-y-3 sm:space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input 
                  placeholder="Search expenses..." 
                  className="pl-10 h-9 sm:h-10 text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <EnhancedSmartFilters
                filterCategory={filterCategory}
                setFilterCategory={setFilterCategory}
                filterRecipient={filterRecipient}
                setFilterRecipient={setFilterRecipient}
                filterDeductible={filterDeductible}
                setFilterDeductible={setFilterDeductible}
                filterSource={filterSource}
                setFilterSource={setFilterSource}
                recipients={recipients}
                onClearFilters={handleClearFilters}
              />
              
              {/* Mobile-optimized date range picker */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal h-9 sm:h-10 text-xs sm:text-sm w-full sm:w-auto",
                      !dateRange && "text-muted-foreground"
                    )}
                  >
                    <Search className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <span className="truncate">
                          {format(dateRange.from, "MMM dd")} - {format(dateRange.to, "MMM dd, y")}
                        </span>
                      ) : (
                        format(dateRange.from, "MMM dd, y")
                      )
                    ) : (
                      <span className="truncate">Filter by date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="range"
                    selected={dateRange}
                    onSelect={(value) => value && setDateRange(value)}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                  <div className="p-3 border-t border-border flex flex-col sm:flex-row justify-between space-y-2 sm:space-y-0">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setDateRange(undefined)}
                      className="text-xs"
                    >
                      Clear
                    </Button>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          const today = new Date();
                          const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
                          setDateRange({ from: firstDay, to: today });
                        }}
                        className="text-xs"
                      >
                        This Month
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          const today = new Date();
                          const thirtyDaysAgo = new Date(today);
                          thirtyDaysAgo.setDate(today.getDate() - 30);
                          setDateRange({ from: thirtyDaysAgo, to: today });
                        }}
                        className="text-xs"
                      >
                        Last 30 Days
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            
            {/* Expense Table */}
            <ExpenseTable 
              expenses={sortedExpenses}
              recipients={recipients}
              onExpenseClick={(expenseId) => navigate(`/expenses/${expenseId}`)}
            />
            
            {/* Mobile-optimized empty state */}
            {sortedExpenses.length === 0 && expenses.length === 0 && (
              <div className="text-center py-8 sm:py-12 px-4">
                <div className="text-muted-foreground mb-3 sm:mb-4 text-sm sm:text-base">Start tracking your caregiving expenses</div>
                <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6 max-w-md mx-auto">
                  Every expense you track helps you understand your caregiving costs and maximize potential tax benefits.
                </p>
                <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-3">
                  <Button onClick={() => navigate('/expenses/new')} className="bg-primary mobile-button">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Your First Expense
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/linked-accounts')} className="mobile-button">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Connect Bank Account
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="insights">
            <div className="text-center py-8 sm:py-12 px-4">
              <BarChart3 className="h-8 w-8 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-medium mb-2">Deep Insights Coming Soon</h3>
              <p className="text-muted-foreground text-xs sm:text-sm max-w-md mx-auto">
                Advanced analytics, spending trends, and personalized recommendations will be available here.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Expenses;
