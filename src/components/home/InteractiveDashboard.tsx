import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from 'recharts';
import { TrendingUp, DollarSign, Receipt, Calendar, ArrowUp, ArrowDown, Target } from 'lucide-react';
import { useExpenseData } from '@/hooks/useExpenseData';
import { format, subMonths, eachMonthOfInterval } from 'date-fns';

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export function InteractiveDashboard() {
  const { expenses, stats } = useExpenseData();
  const [activeTab, setActiveTab] = useState('overview');

  // Calculate category breakdown
  const categoryData = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const categoryChartData = Object.entries(categoryData)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  // Calculate monthly trends (last 6 months)
  const now = new Date();
  const monthsRange = eachMonthOfInterval({
    start: subMonths(now, 5),
    end: now
  });

  const monthlyTrends = monthsRange.map(month => {
    const monthExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === month.getMonth() && 
             expenseDate.getFullYear() === month.getFullYear();
    });

    return {
      month: format(month, 'MMM'),
      total: monthExpenses.reduce((sum, exp) => sum + exp.amount, 0),
      deductible: monthExpenses
        .filter(exp => exp.is_tax_deductible)
        .reduce((sum, exp) => sum + exp.amount, 0),
      count: monthExpenses.length
    };
  });

  // Calculate key metrics with growth indicators
  const currentMonth = stats.thisMonthAmount;
  const lastMonthData = monthlyTrends[monthlyTrends.length - 2];
  const lastMonth = lastMonthData?.total || 0;
  const monthlyGrowth = lastMonth > 0 ? ((currentMonth - lastMonth) / lastMonth) * 100 : 0;

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);

  const MetricCard = ({ 
    title, 
    value, 
    icon: Icon, 
    growth, 
    color = "text-primary" 
  }: {
    title: string;
    value: string;
    icon: any;
    growth?: number;
    color?: string;
  }) => (
    <Card className="hover-scale transition-all duration-300 hover:shadow-lg">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{title}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            {growth && (
              <div className="flex items-center mt-1">
                {growth > 0 ? (
                  <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
                ) : (
                  <ArrowDown className="h-3 w-3 text-red-500 mr-1" />
                )}
                <span className={`text-xs ${growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {Math.abs(growth).toFixed(1)}%
                </span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-full bg-primary/10`}>
            <Icon className={`h-6 w-6 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="px-4 space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="This Month"
          value={formatCurrency(stats.thisMonthAmount)}
          icon={DollarSign}
          growth={monthlyGrowth}
          color="text-green-600"
        />
        <MetricCard
          title="Tax Deductible"
          value={formatCurrency(stats.deductibleAmount)}
          icon={Receipt}
          color="text-blue-600"
        />
        <MetricCard
          title="Total Expenses"
          value={stats.total.toString()}
          icon={Calendar}
          color="text-purple-600"
        />
        <MetricCard
          title="This Year"
          value={formatCurrency(stats.thisYearAmount)}
          icon={Target}
          color="text-orange-600"
        />
      </div>

      {/* Interactive Charts */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Expense Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `$${value}`} />
                    <Tooltip 
                      formatter={(value: number) => [`$${value.toLocaleString()}`, 'Amount']}
                      labelClassName="text-foreground"
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="total" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="categories" className="mt-6">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => 
                        percent > 0.05 ? `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%` : ''
                      }
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number, name: string) => [
                        `$${value.toLocaleString()}`, 
                        name
                      ]}
                      labelFormatter={(label) => `Category: ${label}`}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              {/* Category Legend */}
              <div className="grid grid-cols-2 gap-2 mt-4">
                {categoryChartData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <span className="text-sm text-gray-600 truncate">
                      {entry.name}: ${entry.value.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="trends" className="mt-6">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `$${value}`} />
                    <Tooltip 
                      formatter={(value: number, name: string) => [
                        `$${value.toLocaleString()}`, 
                        name === 'total' ? 'Total' : 'Tax Deductible'
                      ]}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="total" 
                      stroke="#22c55e" 
                      strokeWidth={3}
                      dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="deductible" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}