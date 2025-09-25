import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, TrendingUp, Target, ArrowRight, Sparkles, Calendar, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useExpenseData } from '@/hooks/useExpenseData';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';

export function PersonalizedInsights() {
  const navigate = useNavigate();
  const { expenses, stats } = useExpenseData();
  const [currentInsight, setCurrentInsight] = useState(0);

  // Calculate insights based on user data
  const generateInsights = () => {
    const insights = [];
    const currentMonth = new Date();
    const lastMonth = subMonths(currentMonth, 1);
    
    // Get current and last month expenses
    const currentMonthExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= startOfMonth(currentMonth) && expenseDate <= endOfMonth(currentMonth);
    });
    
    const lastMonthExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= startOfMonth(lastMonth) && expenseDate <= endOfMonth(lastMonth);
    });

    // Tax deduction opportunities
    if (stats.deductible < stats.total * 0.3 && stats.total > 5) {
      insights.push({
        type: 'tax-opportunity',
        icon: DollarSign,
        title: 'Tax Deduction Opportunity',
        description: `Only ${Math.round((stats.deductible / stats.total) * 100)}% of your expenses are marked as tax-deductible. Review your expenses to potentially increase your tax savings.`,
        action: 'Review Expenses',
        actionUrl: '/expenses',
        color: 'from-green-500 to-emerald-600',
        priority: 'high'
      });
    }

    // Monthly spending trends
    if (lastMonthExpenses.length > 0 && currentMonthExpenses.length > 0) {
      const currentTotal = currentMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      const lastTotal = lastMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      const change = ((currentTotal - lastTotal) / lastTotal) * 100;
      
      if (Math.abs(change) > 20) {
        insights.push({
          type: 'spending-trend',
          icon: TrendingUp,
          title: change > 0 ? 'Increased Spending This Month' : 'Decreased Spending This Month',
          description: `Your caregiving expenses are ${Math.abs(change).toFixed(0)}% ${change > 0 ? 'higher' : 'lower'} than last month (${format(lastMonth, 'MMM')}).`,
          action: 'View Trends',
          actionUrl: '/expenses',
          color: change > 0 ? 'from-orange-500 to-red-600' : 'from-blue-500 to-green-600',
          priority: 'medium'
      });
    }
  }

    // Receipt tracking
    const expensesWithoutReceipts = expenses.filter(exp => !exp.receipt_url && !exp.receiptUrl).length;
    if (expensesWithoutReceipts > 3) {
      insights.push({
        type: 'receipt-reminder',
        icon: Calendar,
        title: 'Missing Receipt Documentation',
        description: `${expensesWithoutReceipts} expenses don't have receipts attached. Add receipts to maximize your tax deduction potential.`,
        action: 'Add Receipts',
        actionUrl: '/expenses',
        color: 'from-purple-500 to-pink-600',
        priority: 'medium'
      });
    }

    // Achievement celebrations
    if (stats.total === 10) {
      insights.push({
        type: 'achievement',
        icon: Sparkles,
        title: 'Milestone Reached! 🎉',
        description: "You've tracked 10 caregiving expenses! You're building a solid foundation for tax season.",
        action: 'Keep Going',
        actionUrl: '/expenses',
        color: 'from-yellow-500 to-orange-600',
        priority: 'high'
      });
    }

    // Onboarding tips for new users
    if (stats.total < 3) {
      insights.push({
        type: 'getting-started',
        icon: Target,
        title: 'Getting Started Tips',
        description: 'Track medical appointments, equipment purchases, and transportation costs to maximize your caregiving deductions.',
        action: 'Learn More',
        actionUrl: '/expenses',
        color: 'from-blue-500 to-indigo-600',
        priority: 'high'
      });
    }

    // Sort by priority and return
    const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
    return insights.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
  };

  const insights = generateInsights();

  // Rotate insights every 6 seconds
  useEffect(() => {
    if (insights.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentInsight((prev) => (prev + 1) % insights.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [insights.length]);

  if (insights.length === 0) return null;

  const currentInsightData = insights[currentInsight];
  const IconComponent = currentInsightData.icon;

  return (
    <div className="px-4">
      <Card className="border-0 shadow-lg overflow-hidden relative">
        <div className={`absolute inset-0 bg-gradient-to-r ${currentInsightData.color} opacity-5`}></div>
        
        <CardHeader className="pb-4 relative">
          <CardTitle className="flex items-center text-gray-900">
            <Lightbulb className="h-5 w-5 mr-2 text-amber-600" />
            Personalized Insights
            {insights.length > 1 && (
              <Badge variant="secondary" className="ml-2">
                {currentInsight + 1} of {insights.length}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="relative">
          <div className="min-h-[120px]">
            {insights.map((insight, index) => (
              <div
                key={`${insight.type}-${index}`}
                className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                  index === currentInsight 
                    ? 'opacity-100 transform translate-x-0' 
                    : index < currentInsight 
                      ? 'opacity-0 transform -translate-x-full' 
                      : 'opacity-0 transform translate-x-full'
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${insight.color} shadow-lg`}>
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {insight.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                      {insight.description}
                    </p>
                    
                    <Button
                      onClick={() => navigate(insight.actionUrl)}
                      className={`bg-gradient-to-r ${insight.color} hover:shadow-lg transition-all duration-300 hover-scale`}
                      size="sm"
                    >
                      {insight.action}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Progress indicators */}
          {insights.length > 1 && (
            <div className="flex justify-center space-x-2 mt-6">
              {insights.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentInsight(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentInsight 
                      ? `bg-gradient-to-r ${currentInsightData.color}` 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}