import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, TrendingUp, Target, ArrowRight, Sparkles, Calendar, DollarSign, Play, Pause } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useExpenseData } from '@/hooks/useExpenseData';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';

export function PersonalizedInsights() {
  const navigate = useNavigate();
  const { expenses, stats } = useExpenseData();
  const [currentInsight, setCurrentInsight] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

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
        color: 'emerald',
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
          color: change > 0 ? 'orange' : 'blue',
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
        color: 'purple',
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
        color: 'yellow',
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
        color: 'blue',
        priority: 'high'
      });
    }

    // Sort by priority and return
    const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
    return insights.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
  };

  const insights = generateInsights();

  // Auto-rotate insights
  useEffect(() => {
    if (insights.length <= 1 || !isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentInsight((prev) => (prev + 1) % insights.length);
    }, 8000); // Slower rotation for better UX

    return () => clearInterval(interval);
  }, [insights.length, isAutoPlaying]);

  // Color scheme mappings
  const colorSchemes = {
    emerald: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      button: 'bg-emerald-600 hover:bg-emerald-700',
      dot: 'bg-emerald-500'
    },
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      button: 'bg-blue-600 hover:bg-blue-700',
      dot: 'bg-blue-500'
    },
    purple: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      button: 'bg-purple-600 hover:bg-purple-700',
      dot: 'bg-purple-500'
    },
    orange: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      button: 'bg-orange-600 hover:bg-orange-700',
      dot: 'bg-orange-500'
    },
    yellow: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      button: 'bg-yellow-600 hover:bg-yellow-700',
      dot: 'bg-yellow-500'
    }
  };

  if (insights.length === 0) return null;

  const currentInsightData = insights[currentInsight];
  const IconComponent = currentInsightData.icon;
  const colors = colorSchemes[currentInsightData.color as keyof typeof colorSchemes];

  return (
    <div className="px-4">
      <Card className={`border shadow-lg overflow-hidden ${colors.bg} ${colors.border}`}>        
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-gray-900">
              <Lightbulb className="h-5 w-5 mr-2 text-amber-600" />
              Personalized Insights
            </CardTitle>
            <div className="flex items-center space-x-2">
              {insights.length > 1 && (
                <>
                  <Badge variant="secondary" className="text-xs">
                    {currentInsight + 1} of {insights.length}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                    className="h-8 w-8 p-0"
                  >
                    {isAutoPlaying ? (
                      <Pause className="h-3 w-3" />
                    ) : (
                      <Play className="h-3 w-3" />
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pb-6">
          <div className="min-h-[140px] relative">
            {insights.map((insight, index) => {
              const InsightIcon = insight.icon;
              const insightColors = colorSchemes[insight.color as keyof typeof colorSchemes];
              
              return (
                <div
                  key={`${insight.type}-${index}`}
                  className={`absolute inset-0 transition-all duration-500 ease-in-out ${
                    index === currentInsight 
                      ? 'opacity-100 transform translate-x-0' 
                      : index < currentInsight 
                        ? 'opacity-0 transform -translate-x-full' 
                        : 'opacity-0 transform translate-x-full'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-xl ${insightColors.iconBg} shadow-sm flex-shrink-0`}>
                      <InsightIcon className={`h-6 w-6 ${insightColors.iconColor}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-2 text-lg">
                        {insight.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                        {insight.description}
                      </p>
                      
                      <Button
                        onClick={() => navigate(insight.actionUrl)}
                        className={`${insightColors.button} text-white shadow-sm hover:shadow-md transition-all duration-200`}
                        size="sm"
                      >
                        {insight.action}
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Progress indicators */}
          {insights.length > 1 && (
            <div className="flex justify-center space-x-2 mt-6 pt-4 border-t border-gray-100">
              {insights.map((insight, index) => {
                const dotColors = colorSchemes[insight.color as keyof typeof colorSchemes];
                return (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentInsight(index);
                      setIsAutoPlaying(false); // Pause auto-play when user manually navigates
                    }}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentInsight 
                        ? dotColors.dot
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}