import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Receipt, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

export function RecentActivity() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [recentExpenses, setRecentExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentExpenses = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('expenses')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3);

        if (error) throw error;
        setRecentExpenses(data || []);
      } catch (error) {
        console.error('Error fetching recent expenses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentExpenses();
  }, [user]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Medical': 'bg-blue-100 text-blue-700',
      'Transportation': 'bg-emerald-100 text-emerald-700',
      'Home Care': 'bg-purple-100 text-purple-700',
      'Equipment': 'bg-orange-100 text-orange-700',
      default: 'bg-gray-100 text-gray-700'
    };
    return colors[category] || colors.default;
  };

  if (loading) {
    return (
      <div className="px-4">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded"></div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="px-4">
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-gray-900">
              <Receipt className="h-5 w-5 mr-2 text-gray-600" />
              Recent Activity
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/expenses')}
              className="text-primary hover:text-primary/80"
            >
              View All
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentExpenses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No expenses tracked yet</p>
              <p className="text-sm">Start by adding your first expense above!</p>
            </div>
          ) : (
            recentExpenses.map((expense) => (
              <div
                key={expense.id}
                className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => navigate(`/expenses/${expense.id}`)}
              >
                <div className="bg-white p-2 rounded-lg shadow-sm">
                  <Calendar className="h-4 w-4 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-gray-900 truncate">
                      {expense.vendor || expense.description || 'Expense'}
                    </h4>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(expense.amount)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${getCategoryColor(expense.category)}`}
                    >
                      {expense.category}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {format(new Date(expense.date), 'MMM d')}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}