
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Search, BarChart3, CreditCard, Calculator, TrendingUp, FileText, Download, Sparkles, Filter, RefreshCw, Clock, CheckCircle, XCircle, Stethoscope } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import Layout from '@/components/Layout';
import { useSupabaseCareRecipients } from '@/hooks/useSupabaseCareRecipients';
import { Expense } from '@/types/User';
import { SyncedTransaction } from '@/types/FinancialAccount';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import ExpenseTable from '@/components/expenses/ExpenseTable';
import AutoImportedTransactions from '@/components/expenses/AutoImportedTransactions';
import TaxDeductionProgress from '@/components/expenses/TaxDeductionProgress';
import { TaxExportSection } from '@/components/expenses/TaxExportSection';
import EnhancedSmartFilters from '@/components/expenses/EnhancedSmartFilters';
import { useSyncedTransactions } from '@/hooks/useSyncedTransactions';
import { useAuth } from '@/contexts/AuthContext';
import { useSupabaseProfile } from '@/hooks/useSupabaseProfile';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useExpenseData } from '@/hooks/useExpenseData';

const Expenses = () => {
  // Force rebuild after git revert
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const { profile } = useSupabaseProfile();
  const { toast } = useToast();
  const { expenses, loading, stats, reloadExpenses } = useExpenseData();
  const { recipients } = useSupabaseCareRecipients();
  const { transactions: syncedTransactions, updateTransaction, deleteTransaction } = useSyncedTransactions();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterRecipient, setFilterRecipient] = useState('');
  const [filterDeductible, setFilterDeductible] = useState('');
  const [filterSource, setFilterSource] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');
  const [statusFilter, setStatusFilter] = useState('all');
  const [triageFilter, setTriageFilter] = useState('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  // Filter only unconfirmed potential medical transactions for the review section
  const unconfirmedTransactions = syncedTransactions.filter(
    transaction => transaction.is_potential_medical && !transaction.is_confirmed_medical
  );
  
  // Filter expenses with enhanced filtering
  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = !searchTerm || 
      expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      expense.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.vendor?.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesCategory = !filterCategory || filterCategory === 'all-categories' || expense.category === filterCategory;
    const matchesRecipient = !filterRecipient || filterRecipient === 'all-recipients' || expense.careRecipientId === filterRecipient;
    
    const matchesDeductible = !filterDeductible || filterDeductible === 'all' || 
      (filterDeductible === 'deductible' && expense.is_tax_deductible) ||
      (filterDeductible === 'non-deductible' && !expense.is_tax_deductible);
    
    const matchesSource = !filterSource || filterSource === 'all-sources' ||
      (filterSource === 'manual' && !expense.synced_transaction_id) ||
      (filterSource === 'auto-imported' && expense.synced_transaction_id);

    const matchesStatus = !statusFilter || statusFilter === 'all' ||
      (statusFilter === 'deductible' && expense.is_tax_deductible) ||
      (statusFilter === 'reimbursed' && expense.is_reimbursed) ||
      (statusFilter === 'pending-reimbursement' && !expense.is_reimbursed) ||
      (statusFilter === 'manual' && !expense.synced_transaction_id) ||
      (statusFilter === 'auto-imported' && expense.synced_transaction_id);

    // Triage filter
    const matchesTriage = !triageFilter || triageFilter === 'all' ||
      (triageFilter === 'pending' && expense.triage_status === 'pending') ||
      (triageFilter === 'kept' && expense.triage_status === 'kept') ||
      (triageFilter === 'skipped' && expense.triage_status === 'skipped');
    
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
    
    return matchesSearch && matchesCategory && matchesRecipient && matchesDeductible && matchesSource && matchesStatus && matchesTriage && matchesDateRange;
  });
  
  // Sort expenses based on sortBy selection
  const sortedExpenses = [...filteredExpenses].sort((a, b) => {
    switch (sortBy) {
      case 'date-desc':
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case 'date-asc':
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      case 'amount-desc':
        return b.amount - a.amount;
      case 'amount-asc':
        return a.amount - b.amount;
      case 'category':
        return a.category.localeCompare(b.category);
      case 'vendor':
        return (a.vendor || '').localeCompare(b.vendor || '');
      default:
        return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
  });

  
  const handleClearFilters = () => {
    setFilterCategory('');
    setFilterRecipient('');
    setFilterDeductible('');
    setFilterSource('');
    setStatusFilter('all');
    setTriageFilter('all');
    setSortBy('date-desc');
    setDateRange(undefined);
    setSearchTerm('');
  };

  const handleRefresh = () => {
    reloadExpenses();
  };

  // Get stats for expenses overview - using the centralized stats
  const expenseStats = stats;

  // Handle triage actions
  const handleTriageAction = async (expenseId: string, action: 'keep' | 'skip') => {
    const expense = expenses.find(e => e.id === expenseId);
    
    if (action === 'keep' && expense) {
      // Navigate to expense form with pre-populated data
      const params = new URLSearchParams({
        prefill: 'true',
        external_id: expense.id || expenseId,
        date: expense.date,
        amount: expense.amount.toString(),
        currency: 'USD',
        merchant: expense.vendor || expense.description || '',
        memo: expense.notes || '',
        category_guess: expense.category,
        payment_channel: 'online',
        status: 'posted',
        is_refund: 'false',
        is_medical_related: expense.is_tax_deductible ? 'true' : 'false'
      });
      
      navigate(`/expenses/new?${params.toString()}`);
      return;
    }
    
    const dbAction = action === 'keep' ? 'kept' : 'skipped';
    
    try {
      const { error } = await supabase
        .from('expenses')
        .update({ triage_status: dbAction })
        .eq('id', expenseId)
        .eq('user_id', authUser?.id);

      if (error) throw error;

      // Update local state - since we're using the hook, we'll refresh the data
      reloadExpenses();

      toast({
        title: action === 'keep' ? 'Expense Kept' : 'Expense Skipped',
        description: `Expense has been marked as ${action === 'keep' ? 'kept' : 'skipped'}.`,
      });
    } catch (error) {
      console.error('Error updating expense triage status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update expense status. Please try again.',
        variant: 'destructive',
      });
    }
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
      reloadExpenses();
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

  // Deductions calculations
  const currentYear = new Date().getFullYear();
  const householdAGI = profile?.household_agi || 75000;
  const threshold = householdAGI * 0.075;

  const thisYearExpenses = expenses.filter(expense => 
    new Date(expense.date).getFullYear() === currentYear
  );

  const deductibleExpenses = thisYearExpenses.filter(expense => 
    expense.is_tax_deductible
  );

  const totalDeductible = deductibleExpenses.reduce((sum, expense) => 
    sum + expense.amount, 0
  );

  const unlockedDeductions = Math.max(0, totalDeductible - threshold);
  const progressPercent = Math.min(100, (totalDeductible / threshold) * 100);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
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
            <Button variant="outline" onClick={handleRefresh} className="mobile-button">
              <RefreshCw className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Refresh</span>
              <span className="sm:hidden">Sync</span>
            </Button>
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

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="font-bold">{expenseStats.total}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-600" />
              <div>
                <p className="text-sm text-muted-foreground">Pending Review</p>
                <p className="font-bold">{expenseStats.pending}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Kept</p>
                <p className="font-bold">{expenseStats.kept}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-gray-600" />
              <div>
                <p className="text-sm text-muted-foreground">Skipped</p>
                <p className="font-bold">{expenseStats.skipped}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-emerald-600" />
              <div>
                <p className="text-sm text-muted-foreground">Deductible</p>
                <p className="font-bold">{expenseStats.deductible}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="font-bold">{expenseStats.thisMonth}</p>
              </div>
            </div>
          </Card>
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
        
        <Tabs defaultValue="list" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-3 h-9 sm:h-10">
            <TabsTrigger value="list" className="text-xs sm:text-sm">Expenses</TabsTrigger>
            <TabsTrigger value="deductions" className="text-xs sm:text-sm">
              <Calculator className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Tax Deductions</span>
              <span className="sm:hidden">Tax</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="text-xs sm:text-sm">
              <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Deep Insights</span>
              <span className="sm:hidden">Insights</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="list" className="space-y-4 sm:space-y-6">
            {/* Enhanced Filters */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filter & Sort Expenses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                  <Select
                    value={triageFilter}
                    onValueChange={setTriageFilter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by review status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Reviews</SelectItem>
                      <SelectItem value="pending">Needs Review</SelectItem>
                      <SelectItem value="kept">Kept</SelectItem>
                      <SelectItem value="skipped">Skipped</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={statusFilter}
                    onValueChange={setStatusFilter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Expenses</SelectItem>
                      <SelectItem value="deductible">Tax Deductible</SelectItem>
                      <SelectItem value="reimbursed">Reimbursed</SelectItem>
                      <SelectItem value="pending-reimbursement">Pending Reimbursement</SelectItem>
                      <SelectItem value="manual">Manual Entry</SelectItem>
                      <SelectItem value="auto-imported">Auto-Imported</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={sortBy}
                    onValueChange={setSortBy}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date-desc">Date (Newest First)</SelectItem>
                      <SelectItem value="date-asc">Date (Oldest First)</SelectItem>
                      <SelectItem value="amount-desc">Amount (Highest First)</SelectItem>
                      <SelectItem value="amount-asc">Amount (Lowest First)</SelectItem>
                      <SelectItem value="category">Category (A-Z)</SelectItem>
                      <SelectItem value="vendor">Vendor (A-Z)</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-sm">
                      Review: {triageFilter === 'all' ? 'All expenses' : 
                              triageFilter === 'pending' ? 'Needs review' :
                              triageFilter === 'kept' ? 'Kept expenses' :
                              'Skipped expenses'}
                    </Badge>
                  </div>

                  <Button variant="outline" onClick={handleClearFilters} size="sm">
                    Clear All Filters
                  </Button>
                </div>
              </CardContent>
            </Card>

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
              onTriageAction={handleTriageAction}
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

          <TabsContent value="deductions" className="space-y-4 sm:space-y-6">
            {/* Progress Overview */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center text-gray-900">
                  <Calculator className="h-6 w-6 mr-3 text-emerald-600" />
                  Deduction Progress for {currentYear}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Progress Bar */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700">Medical expenses tracked</span>
                    <span className="text-lg font-bold text-gray-900">{formatCurrency(totalDeductible)}</span>
                  </div>
                  <Progress value={progressPercent} className="h-4" />
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>IRS 7.5% AGI Threshold: {formatCurrency(threshold)}</span>
                    <span>{Math.round(progressPercent)}%</span>
                  </div>
                </div>

                {/* Unlocked Amount */}
                {unlockedDeductions > 0 ? (
                  <div className="bg-gradient-to-r from-emerald-100 to-green-100 rounded-xl p-6 border border-emerald-200">
                    <div className="flex items-center space-x-3 mb-3">
                      <Sparkles className="h-6 w-6 text-emerald-600" />
                      <h3 className="text-xl font-bold text-emerald-800">
                        {formatCurrency(unlockedDeductions)} Potential Deduction
                      </h3>
                    </div>
                    <p className="text-emerald-700">
                      These medical expenses exceed your AGI threshold and may be tax deductible. 
                      Consult with a tax professional for guidance.
                    </p>
                  </div>
                ) : (
                  <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                    <h3 className="font-semibold text-blue-800 mb-2">Keep tracking!</h3>
                    <p className="text-blue-700">
                      You need {formatCurrency(threshold - totalDeductible)} more in medical expenses 
                      to reach the IRS deduction threshold.
                    </p>
                  </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{formatCurrency(unlockedDeductions)}</div>
                    <div className="text-xs text-gray-600">Unlocked deductions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-600">{deductibleExpenses.length}</div>
                    <div className="text-xs text-gray-600">Deductible items</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{formatCurrency(threshold)}</div>
                    <div className="text-xs text-gray-600">AGI threshold</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Deductible Expenses List */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-gray-900">
                    <FileText className="h-5 w-5 mr-2 text-gray-600" />
                    Deductible Expenses ({currentYear})
                  </CardTitle>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    {deductibleExpenses.length} items
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {deductibleExpenses.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No deductible expenses tracked yet</p>
                    <p className="text-sm">Add expenses and mark them as tax deductible</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {deductibleExpenses.map((expense) => (
                      <div
                        key={expense.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div className="font-medium text-gray-900">
                              {expense.vendor || expense.description || 'Medical Expense'}
                            </div>
                            <Badge 
                              variant="outline" 
                              className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                            >
                              {expense.category}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            {format(new Date(expense.date), 'MMM d, yyyy')}
                            {expense.notes && (
                              <span className="ml-2">• {expense.notes}</span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-gray-900">
                            {formatCurrency(expense.amount)}
                          </div>
                          {expense.synced_transaction_id && (
                            <Badge variant="secondary" className="text-xs mt-1">
                              Auto-imported
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              </CardContent>
            </Card>

            {/* Tax Export Section */}
            <TaxExportSection expenses={expenses} />

            {/* Tax Tips */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center text-gray-900">
                  <TrendingUp className="h-5 w-5 mr-2 text-amber-600" />
                  Tax Planning Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-gray-700">
                      <strong>7.5% AGI Rule:</strong> Only medical expenses exceeding 7.5% of your AGI are deductible.
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-gray-700">
                      <strong>Keep Records:</strong> Save all receipts and documentation for tax deductible expenses.
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-gray-700">
                      <strong>Consult a Professional:</strong> Always verify with a tax professional before claiming deductions.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
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
