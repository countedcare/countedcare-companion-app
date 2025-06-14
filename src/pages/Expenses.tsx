
import React, { useState } from 'react';
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

const Expenses = () => {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useLocalStorage<Expense[]>('countedcare-expenses', []);
  const [recipients] = useLocalStorage<CareRecipient[]>('countedcare-recipients', []);
  const [syncedTransactions, setSyncedTransactions] = useLocalStorage<SyncedTransaction[]>('countedcare-synced-transactions', []);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterRecipient, setFilterRecipient] = useState('');
  const [filterDeductible, setFilterDeductible] = useState('');
  const [filterSource, setFilterSource] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  
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

  const handleConfirmTransaction = (transactionId: string, expenseData: any) => {
    const newExpense: Expense = {
      id: `exp-${Date.now()}`,
      ...expenseData
    };
    
    setExpenses(prev => [...prev, newExpense]);
    
    // Mark transaction as confirmed
    setSyncedTransactions(prev => 
      prev.map(t => 
        t.id === transactionId 
          ? { ...t, is_confirmed_medical: true, expense_id: newExpense.id }
          : t
      )
    );
  };

  const handleExcludeTransaction = (transactionId: string) => {
    setSyncedTransactions(prev => 
      prev.filter(t => t.id !== transactionId)
    );
  };

  const handleEditTransaction = (transactionId: string, updates: Partial<SyncedTransaction>) => {
    setSyncedTransactions(prev => 
      prev.map(t => 
        t.id === transactionId 
          ? { ...t, ...updates }
          : t
      )
    );
  };
  
  return (
    <Layout>
      <div className="container-padding py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-heading">Track & Understand</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Monitor your caregiving expenses and discover opportunities to save
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => navigate('/linked-accounts')}>
              <CreditCard className="mr-2 h-4 w-4" />
              Link Bank Account
            </Button>
            <Button onClick={() => navigate('/expenses/new')} className="bg-primary">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Expense
            </Button>
          </div>
        </div>
        
        {/* Auto-imported transactions review */}
        <AutoImportedTransactions
          transactions={syncedTransactions}
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
        
        <Tabs defaultValue="list" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list">Expense List</TabsTrigger>
            <TabsTrigger value="insights">
              <BarChart3 className="w-4 h-4 mr-2" />
              Deep Insights
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="list" className="space-y-6">
            {/* Search and Enhanced Smart Filters */}
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input 
                  placeholder="Search expenses..." 
                  className="pl-10"
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
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !dateRange && "text-muted-foreground"
                    )}
                  >
                    <Search className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y")} -{" "}
                          {format(dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Filter by date range</span>
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
                  <div className="p-3 border-t border-border flex justify-between">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setDateRange(undefined)}
                    >
                      Clear
                    </Button>
                    <div className="space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          const today = new Date();
                          const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
                          setDateRange({ from: firstDay, to: today });
                        }}
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
            
            {sortedExpenses.length === 0 && expenses.length === 0 && (
              <div className="text-center py-12">
                <div className="text-muted-foreground mb-4">Start tracking your caregiving expenses</div>
                <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                  Every expense you track helps you understand your caregiving costs and maximize potential tax benefits.
                </p>
                <div className="flex justify-center space-x-3">
                  <Button onClick={() => navigate('/expenses/new')} className="bg-primary">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Your First Expense
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/linked-accounts')}>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Connect Bank Account
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="insights">
            <div className="text-center py-12">
              <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Deep Insights Coming Soon</h3>
              <p className="text-muted-foreground">
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
