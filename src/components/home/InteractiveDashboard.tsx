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
  const { expenses, stats, loading } = useExpenseData();
  const [activeTab, setActiveTab] = useState('overview');
  const [isChartReady, setIsChartReady] = useState(false);

  // Debounced chart updates for better performance
  React.useEffect(() => {
    const timer = setTimeout(() => setIsChartReady(true), 300);
    return () => clearTimeout(timer);
  }, [expenses]);

  if (loading || !isChartReady) {
    return (
      <div className="px-4 space-y-6">
        {/* Loading skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-16 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <Card className="border-0 shadow-lg animate-pulse">
          <CardContent className="p-6">
            <div className="h-80 bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Only show if there's meaningful data
  if (expenses.length === 0) {
    return (
      <div className="px-4">
        <Card className="border-dashed border-2 border-gray-200 hover-scale">
          <CardContent className="p-8 text-center">
            <div className="max-w-sm mx-auto">
              <div className="mb-4">
                <TrendingUp className="h-12 w-12 text-gray-400 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No expense data yet
              </h3>
              <p className="text-gray-600 mb-4">
                Start tracking your caregiving expenses to see beautiful analytics here.
              </p>
              <Button onClick={() => window.location.href = '/expenses/new'}>
                Add Your First Expense
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
    <Card className="hover-scale transition-all duration-300 hover:shadow-lg group">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted-foreground mb-1 truncate">{title}</p>
            <p className={`text-xl md:text-2xl font-bold ${color} group-hover:scale-105 transition-transform`}>
              {value}
            </p>
            {growth !== undefined && (
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
          <div className={`p-2 md:p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors`}>
            <Icon className={`h-5 w-5 md:h-6 md:w-6 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="px-4 space-y-6 animate-fade-in">
      {/* Key Metrics Grid - More responsive */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
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

      {/* Interactive Charts - Performance optimized */}
      <Card className="border-0 shadow-lg overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center text-lg">
            <TrendingUp className="h-5 w-5 mr-2" />
            Expense Analytics
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="overview" className="text-sm">Overview</TabsTrigger>
              <TabsTrigger value="categories" className="text-sm">Categories</TabsTrigger>
              <TabsTrigger value="trends" className="text-sm">Trends</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-0">
              <div className="h-56 md:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyTrends} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis 
                      dataKey="month" 
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      tickFormatter={(value) => `$${value}`} 
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip 
                      formatter={(value: number) => [`$${value.toLocaleString()}`, 'Amount']}
                      labelClassName="text-foreground"
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}
                    />
                    <Bar 
                      dataKey="total" 
                      fill="#22c55e" 
                      radius={[4, 4, 0, 0]}
                      className="hover:opacity-80 transition-opacity"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="categories" className="space-y-0">
              <div className="h-64 md:h-80">
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
                      outerRadius={window.innerWidth < 768 ? 80 : 100}
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
              
              {/* Category Legend - More compact on mobile */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4">
                {categoryChartData.slice(0, 6).map((entry, index) => (
                  <div key={entry.name} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                    <div 
                      className="w-3 h-3 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <span className="text-sm text-gray-600 truncate">
                      {entry.name}: ${entry.value.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="trends" className="space-y-0">
              <div className="h-56 md:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyTrends} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis 
                      dataKey="month" 
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      tickFormatter={(value) => `$${value}`} 
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip 
                      formatter={(value: number, name: string) => [
                        `$${value.toLocaleString()}`, 
                        name === 'total' ? 'Total' : 'Tax Deductible'
                      ]}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="total" 
                      stroke="#22c55e" 
                      strokeWidth={3}
                      dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
                      className="drop-shadow-sm"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="deductible" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
                      className="drop-shadow-sm"
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