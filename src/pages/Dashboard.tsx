
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { PlusCircle, TrendingUp, Receipt, PieChart, ArrowRight, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, Legend } from 'recharts';
import Layout from '@/components/Layout';
import useLocalStorage from '@/hooks/useLocalStorage';
import { User, Expense, CareRecipient, EXPENSE_CATEGORIES } from '@/types/User';
import { useState } from 'react';

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
  
  // Mock data for the tax threshold (normally this would come from a calculation based on user income)
  const taxThreshold = 7500;
  const progressPercentage = Math.min((totalExpenses / taxThreshold) * 100, 100);
  
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

  return (
    <Layout>
      <div className="container-padding py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-heading">Hi, {user.name || 'there'}!</h1>
          <p className="text-gray-600">Here's your caregiving expense summary</p>
        </div>

        {/* Main Stats Card */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Expense Summary</CardTitle>
            <CardDescription>
              Track your progress towards tax deduction threshold
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-2">
              <div>
                <span className="text-lg font-medium">${totalExpenses.toLocaleString()}</span>
                <span className="text-sm text-gray-500 ml-2">
                  {timeFrame === 'month' ? 'this month' : 'this year'}
                </span>
              </div>
              <Select value={timeFrame} onValueChange={(value: 'month' | 'year') => setTimeFrame(value)}>
                <SelectTrigger className="w-[120px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-1 mb-4">
              <div className="flex justify-between text-sm">
                <span>Medical Expenses</span>
                <span>${(categoryTotals.find(c => c.name === 'Medical')?.value || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Most Expensive: {mostExpensiveCategory}</span>
                <span>${(categoryTotals[0]?.value || 0).toLocaleString()}</span>
              </div>
            </div>
            
            <div className="flex justify-between mb-2">
              <span className="font-medium">Tax Threshold Progress</span>
              <span className="text-sm text-gray-500">Threshold: ${taxThreshold.toLocaleString()}</span>
            </div>
            <Progress value={progressPercentage} className="h-2 mb-2" />
            
            <div className="flex justify-between text-sm">
              <span>{progressPercentage.toFixed(0)}% of threshold</span>
              <span>${(taxThreshold - totalExpenses).toLocaleString()} to go</span>
            </div>
          </CardContent>
        </Card>

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
                      <Tooltip formatter={(value) => `$${value}`} />
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
                    <Tooltip formatter={(value) => `$${value}`} />
                    <Bar dataKey="amount" fill="#6DAAE2" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

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
