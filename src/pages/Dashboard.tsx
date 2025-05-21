
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { PlusCircle, TrendingUp, Receipt, PieChart, ArrowRight, Filter, Info } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartTooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, Legend } from 'recharts';
import Layout from '@/components/Layout';
import useLocalStorage from '@/hooks/useLocalStorage';
import { User, Expense, CareRecipient, EXPENSE_CATEGORIES } from '@/types/User';

const COLORS = ['#6DAAE2', '#A0D5D8', '#7FC7D9', '#5F9EA0', '#87CEEB', '#B0C4DE'];

const Dashboard = () => {
  const navigate = useNavigate();
  const [user] = useLocalStorage<User>('countedcare-user', {
    name: '',
    email: '',
    isCaregiver: true,
    onboardingComplete: false
  });
  
  const [expenses] = useLocalStorage<Expense[]>('countedcare-expenses', []);
  const [recipients] = useLocalStorage<CareRecipient[]>('countedcare-recipients', []);
  const [timeFrame, setTimeFrame] = useState<'month' | 'year'>('month');
  
  // Redirect to onboarding if not completed
  React.useEffect(() => {
    if (!user.onboardingComplete) {
      navigate('/');
    }
  }, [user, navigate]);

  // Calculate total expenses for current period
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      
      if (timeFrame === 'month') {
        return expenseDate.getMonth() === currentMonth && 
               expenseDate.getFullYear() === currentYear;
      } else {
        return expenseDate.getFullYear() === currentYear;
      }
    });
  }, [expenses, timeFrame, currentMonth, currentYear]);
  
  // Calculate total expenses
  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const yearlyExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate.getFullYear() === currentYear;
  }).reduce((sum, expense) => sum + expense.amount, 0);
  
  // Calculate category totals
  const categoryTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    
    filteredExpenses.forEach(expense => {
      if (!totals[expense.category]) {
        totals[expense.category] = 0;
      }
      totals[expense.category] += expense.amount;
    });
    
    return Object.entries(totals).map(([name, value]) => ({
      name,
      value
    })).sort((a, b) => b.value - a.value);
  }, [filteredExpenses]);
  
  // Find most expensive category
  const mostExpensiveCategory = categoryTotals[0]?.name || 'None';
  
  // Calculate tax threshold based on income
  // If householdAGI is not set, use default threshold
  const householdAGI = user.householdAGI || 100000; // Default 100k if not set
  const incomeThreshold = householdAGI * 0.075; // 7.5% of income
  const incomeProgressPercentage = Math.min((yearlyExpenses / incomeThreshold) * 100, 100);
  
  // Get the latest expenses
  const latestExpenses = [...expenses].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  ).slice(0, 3);
  
  // Monthly data for bar chart
  const monthlyData = useMemo(() => {
    const data: Record<string, number> = {};
    
    // Initialize all months/categories
    if (timeFrame === 'month') {
      EXPENSE_CATEGORIES.forEach(category => {
        data[category] = 0;
      });
      
      // Fill in actual data
      filteredExpenses.forEach(expense => {
        data[expense.category] += expense.amount;
      });
      
      return Object.entries(data).map(([name, amount]) => ({
        name,
        amount
      }));
    } else {
      // Initialize all months
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      monthNames.forEach(month => {
        data[month] = 0;
      });
      
      // Fill in actual data
      expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getFullYear() === currentYear;
      }).forEach(expense => {
        const expenseDate = new Date(expense.date);
        const monthName = monthNames[expenseDate.getMonth()];
        data[monthName] += expense.amount;
      });
      
      return Object.entries(data).map(([name, amount]) => ({
        name,
        amount
      }));
    }
  }, [filteredExpenses, timeFrame, EXPENSE_CATEGORIES, expenses, currentYear]);

  // Format currency helper
  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString()}`;
  };

  const nextPayday = useMemo(() => {
    // Just a simple calculation - assuming payday is every 2 weeks on Friday
    const today = new Date();
    const friday = new Date();
    friday.setDate(today.getDate() + (5 - today.getDay() + 7) % 7);
    if ((friday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24) < 7) {
      friday.setDate(friday.getDate() + 14);
    }
    const daysUntil = Math.ceil((friday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntil;
  }, []);

  return (
    <Layout>
      <div className="container-padding py-6">
        {/* Header with name and overview stats */}
        <div className="bg-primary rounded-lg p-5 text-white mb-6">
          <div className="mb-4">
            <h1 className="text-2xl font-heading">Hi, {user.name || 'there'}!</h1>
            <p className="text-white/90">Your caregiving expense summary</p>
          </div>
          
          <Card className="bg-white text-foreground">
            <CardContent className="p-4">
              <div className="flex flex-col">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Current spend this {timeFrame}</p>
                    <h2 className="text-3xl font-bold mt-1">{formatCurrency(totalExpenses)}</h2>
                  </div>
                  <div className="text-right">
                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      <span>{formatCurrency(incomeThreshold - yearlyExpenses)} below threshold</span>
                    </div>
                    <Select value={timeFrame} onValueChange={(value: 'month' | 'year') => setTimeFrame(value)}>
                      <SelectTrigger className="w-[120px] h-8 mt-2 bg-muted/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="month">This Month</SelectItem>
                        <SelectItem value="year">This Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="mt-4 mb-2">
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center">
                      <span className="text-sm font-medium">Tax Threshold Progress</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 ml-1 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Medical expenses over 7.5% of your income may be tax deductible</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <span className="text-sm text-muted-foreground">{incomeProgressPercentage.toFixed(0)}% of threshold</span>
                  </div>
                  <Progress value={incomeProgressPercentage} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Current: {formatCurrency(yearlyExpenses)}</span>
                    <span>Threshold: {formatCurrency(incomeThreshold)}</span>
                  </div>
                </div>

                <div className="flex items-center mt-4 pt-3 border-t">
                  <div className="bg-green-100 text-green-800 p-1 rounded">
                    <Receipt className="h-4 w-4" />
                  </div>
                  <div className="ml-2">
                    <p className="text-sm">Payday in {nextPayday} days</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Account Summary */}
        <div className="mb-6">
          <h2 className="text-lg font-medium mb-3">Expense Accounts</h2>
          <div className="space-y-3">
            <Card className="bg-neutral">
              <CardContent className="p-4 flex justify-between items-center">
                <div className="flex items-center">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Receipt className="h-5 w-5 text-primary" />
                  </div>
                  <div className="ml-3">
                    <h3 className="font-medium">Medical Expenses</h3>
                    <p className="text-sm text-muted-foreground">{(categoryTotals.find(c => c.name === 'Medical Care')?.value || 0).toLocaleString()}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="text-primary border-primary" onClick={() => navigate('/expenses')}>
                  View
                </Button>
              </CardContent>
            </Card>
            
            <Card className="bg-neutral">
              <CardContent className="p-4 flex justify-between items-center">
                <div className="flex items-center">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Receipt className="h-5 w-5 text-primary" />
                  </div>
                  <div className="ml-3">
                    <h3 className="font-medium">In-Home Care</h3>
                    <p className="text-sm text-muted-foreground">{(categoryTotals.find(c => c.name === 'In-Home Care')?.value || 0).toLocaleString()}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="text-primary border-primary" onClick={() => navigate('/expenses')}>
                  View
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Button 
            onClick={() => navigate('/expenses/new')} 
            className="flex-col h-24 bg-primary text-white"
          >
            <PlusCircle className="mb-1" size={24} />
            <span>Add Expense</span>
          </Button>
          <Button 
            onClick={() => navigate('/care-recipients/new')} 
            className="flex-col h-24 bg-accent text-accent-foreground"
          >
            <PlusCircle className="mb-1" size={24} />
            <span>Add Care Recipient</span>
          </Button>
        </div>

        {/* Expense Charts */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Expense Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex mb-4 justify-between items-center">
              <h3 className="font-medium">
                {timeFrame === 'month' ? 'By Category' : 'Monthly Spending'}
              </h3>
            </div>
            
            <div className="h-[250px]">
              {timeFrame === 'month' ? (
                // Pie Chart for category breakdown
                filteredExpenses.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={categoryTotals}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {categoryTotals.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend />
                      <RechartTooltip formatter={(value) => `$${value}`} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    No expense data to display
                  </div>
                )
              ) : (
                // Bar Chart for monthly spending
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartTooltip formatter={(value) => `$${value}`} />
                    <Bar dataKey="amount" fill="#6DAAE2" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Latest Expenses */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Latest Expenses</CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/expenses')}
                className="text-primary"
              >
                View All
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {latestExpenses.length > 0 ? (
              <div className="space-y-3">
                {latestExpenses.map((expense) => (
                  <div 
                    key={expense.id} 
                    className="flex justify-between items-center p-3 bg-neutral rounded-md"
                    onClick={() => navigate(`/expenses/${expense.id}`)}
                  >
                    <div>
                      <div className="font-medium">{expense.description || expense.category}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(expense.date).toLocaleDateString()}
                        {expense.careRecipientName && ` • ${expense.careRecipientName}`}
                      </div>
                    </div>
                    <div className="font-medium">${expense.amount.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <p>No expenses recorded yet</p>
                <Button 
                  variant="outline" 
                  className="mt-2"
                  onClick={() => navigate('/expenses/new')}
                >
                  Add Your First Expense
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;
