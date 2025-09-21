import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Receipt, FileText, DollarSign, Calendar, Calculator, Hash, Star, Flame, Camera, Car, PenTool } from 'lucide-react';
import Layout from '@/components/Layout';
import { Expense } from '@/types/User';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ReceiptCaptureModal from '@/components/ReceiptCaptureModal';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import ExpenseChart from '@/components/dashboard/ExpenseChart';
import { SpendingSummaryHeader } from '@/components/dashboard/SpendingSummaryHeader';
import { AccountsOverview } from '@/components/dashboard/AccountsOverview';
import { PaydayCountdown } from '@/components/dashboard/PaydayCountdown';
import { useSupabaseProfile } from '@/hooks/useSupabaseProfile';
import { HomeTransactions } from '@/pages/home/HomeTransactions';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const { profile } = useSupabaseProfile();
  
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFrame, setTimeFrame] = useState<'month' | 'year'>('month');
  
  // Redirect to onboarding if not completed
  React.useEffect(() => {
    if (!profile?.onboarding_complete) {
      navigate('/');
    }
  }, [profile, navigate]);

  // SEO basics for this view
  React.useEffect(() => {
    document.title = 'Caregiving Dashboard – Expense Breakdown';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'See where caregiving expenses go with a category pie chart and quick actions.');
  }, []);

  // Load expenses from Supabase
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
        triage_status: (expense.triage_status as 'pending' | 'kept' | 'skipped') || 'pending',
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

  // Auto-show receipt modal on first visit
  useEffect(() => {
    if (!loading && expenses.length === 0) {
      setShowReceiptModal(true);
    }
  }, [loading, expenses.length]);

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const potentiallyDeductible = expenses.filter(e => e.is_potentially_deductible === true);
  const deductibleAmount = potentiallyDeductible.reduce((sum, expense) => sum + expense.amount, 0);
  
  // Get current and last month expenses
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  const thisMonthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
  });
  
  const thisMonthTotal = thisMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  // Calculate display values based on timeFrame
  const displayExpenses = timeFrame === 'month' ? thisMonthExpenses : expenses;
  const displayTotal = timeFrame === 'month' ? thisMonthTotal : totalExpenses;
  const budgetAmount = 2500; // Could be from user profile/settings
  
  // Mock account data - in real app, this would come from linked accounts
  const mockAccounts = [
    { id: '1', type: 'checking' as const, name: 'Checking', balance: 5848 },
    { id: '2', type: 'card_balance' as const, name: 'Card Balance', balance: 2001 },
    { id: '3', type: 'net_cash' as const, name: 'Net Cash', balance: 3847 },
    { id: '4', type: 'savings' as const, name: 'Savings', balance: 267 },
    { id: '5', type: 'investments' as const, name: 'Investments', balance: 0 },
  ];
  
  // Calculate days until next payday (mock - every 2 weeks)
  const today = new Date();
  const daysSinceEpoch = Math.floor(today.getTime() / (1000 * 60 * 60 * 24));
  const daysUntilPayday = 14 - (daysSinceEpoch % 14);
  
  // Build category totals for current month (for pie chart)
  const categoryTotals = Object.values(
    thisMonthExpenses.reduce((acc, e) => {
      const key = e.category || 'Uncategorized';
      if (!acc[key]) acc[key] = { name: key, value: 0 };
      acc[key].value += Number(e.amount || 0);
      return acc;
    }, {} as Record<string, { name: string; value: number }>)
  ).sort((a, b) => b.value - a.value);

  // Monthly totals for current year (for potential bar chart)
  const monthLabels = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const monthlyTotals = new Array(12).fill(0);
  expenses.forEach((e) => {
    const d = new Date(e.date);
    if (d.getFullYear() === currentYear) {
      monthlyTotals[d.getMonth()] += Number(e.amount || 0);
    }
  });
  const monthlyData = monthLabels.map((name, i) => ({ name, amount: Number(monthlyTotals[i].toFixed(2)) }));
  
  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (loading || !profile) {
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
        {/* Spending Summary Header */}
        <SpendingSummaryHeader
          currentSpend={displayTotal}
          budgetAmount={budgetAmount}
          timeFrame={timeFrame}
          onTimeFrameChange={setTimeFrame}
          formatCurrency={formatCurrency}
        />
        
        {/* Payday Countdown */}
        <PaydayCountdown daysUntilPayday={daysUntilPayday} />
        
        {/* Accounts Overview */}
        <AccountsOverview accounts={mockAccounts} formatCurrency={formatCurrency} />

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4">
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Total Tracked</div>
                  <div className="text-xl font-bold">{formatCurrency(totalExpenses)}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">This Month</div>
                  <div className="text-xl font-bold">{formatCurrency(thisMonthTotal)}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Calculator className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Tax Deductible</div>
                  <div className="text-xl font-bold">{formatCurrency(deductibleAmount)}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Hash className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Total Items</div>
                  <div className="text-xl font-bold">{expenses.length}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gamification Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 px-4 mb-4">
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Star className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="text-lg font-semibold">Level 1</div>
                  <div className="text-sm text-gray-600">Newcomer</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">15</div>
                  <div className="text-sm text-gray-600">Total XP</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Flame className="h-6 w-6 text-orange-600" />
                </div>
                <div className="flex-1">
                  <div className="text-lg font-semibold">0 Day Streak</div>
                  <div className="text-sm text-gray-600">Weekly: 1/5</div>
                </div>
                <div className="w-20 h-2 bg-gray-200 rounded-full">
                  <div className="w-1/5 h-full bg-orange-500 rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Navigation */}
        <div className="px-4">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-5 bg-white shadow-sm">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="transactions">Review</TabsTrigger>
              <TabsTrigger value="expenses">Expenses</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4 mt-4">
              {/* Quick Track Actions */}
              <Card className="bg-white border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="text-center space-y-4 mb-6">
                    <h2 className="text-xl font-semibold">Track Today's Caregiving Costs</h2>
                    <p className="text-gray-600">
                      Choose your preferred way to add an expense
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    {/* Scan Receipt */}
                    <Button
                      onClick={() => setShowReceiptModal(true)}
                      variant="ghost"
                      className="w-full h-16 flex items-center justify-start space-x-4 p-4 rounded-xl border transition-all duration-200 hover:scale-[1.02] hover:shadow-md bg-white border-gray-200 hover:bg-gray-50"
                    >
                      <div className="p-3 rounded-xl bg-blue-100">
                        <Camera className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-gray-800">Scan a Receipt</div>
                        <p className="text-sm text-gray-500">Capture or upload receipt photo</p>
                      </div>
                    </Button>

                    {/* Enter Mileage */}
                    <Button
                      onClick={() => navigate('/mileage/new')}
                      variant="ghost"
                      className="w-full h-16 flex items-center justify-start space-x-4 p-4 rounded-xl border transition-all duration-200 hover:scale-[1.02] hover:shadow-md bg-white border-gray-200 hover:bg-gray-50"
                    >
                      <div className="p-3 rounded-xl bg-green-100">
                        <Car className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-gray-800">Enter Mileage</div>
                        <p className="text-sm text-gray-500">Track car travel expenses</p>
                      </div>
                    </Button>

                    {/* Manual Expense */}
                    <Button
                      onClick={() => navigate('/expenses/new')}
                      variant="ghost"
                      className="w-full h-16 flex items-center justify-start space-x-4 p-4 rounded-xl border transition-all duration-200 hover:scale-[1.02] hover:shadow-md bg-white border-gray-200 hover:bg-gray-50"
                    >
                      <div className="p-3 rounded-xl bg-purple-100">
                        <PenTool className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-gray-800">Add Expense</div>
                        <p className="text-sm text-gray-500">Manual entry form</p>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Expense Breakdown Chart */}
              <ExpenseChart
                timeFrame={timeFrame}
                categoryTotals={categoryTotals}
                monthlyData={monthlyData}
                filteredExpenses={displayExpenses as unknown as any[]}
              />
            </TabsContent>

            <TabsContent value="transactions" className="mt-4">
              <HomeTransactions />
            </TabsContent>

            <TabsContent value="expenses">
              <Card className="bg-white border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="text-center py-8">
                    <p className="text-gray-600">View all your expenses here</p>
                    <Button 
                      onClick={() => navigate('/expenses')}
                      className="mt-4"
                    >
                      View All Expenses
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="insights">
              <Card className="bg-white border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="text-center py-8">
                    <p className="text-gray-600">Expense insights coming soon</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="achievements">
              <Card className="bg-white border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="text-center py-8">
                    <p className="text-gray-600">Track your achievements here</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <ReceiptCaptureModal
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
        onExpenseAdded={() => {
          loadExpenses();
          setShowReceiptModal(false);
        }}
      />
    </Layout>
  );
};

export default Dashboard;
