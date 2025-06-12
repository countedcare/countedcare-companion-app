
import React from 'react';
import { ArrowRight, Plus, Heart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Expense } from '@/types/User';

interface LatestExpensesProps {
  latestExpenses: Expense[];
}

const LatestExpenses = ({ latestExpenses }: LatestExpensesProps) => {
  const navigate = useNavigate();

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center">
            Recent Expenses
            <Heart className="ml-2 h-4 w-4 text-red-400" />
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/expenses')}
            className="text-primary hover:bg-primary/10"
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
                className="flex justify-between items-center p-3 bg-neutral rounded-md hover:bg-neutral-dark transition-colors cursor-pointer"
                onClick={() => navigate(`/expenses/${expense.id}`)}
              >
                <div>
                  <div className="font-medium">{expense.description || expense.category}</div>
                  <div className="text-sm text-gray-500">
                    {new Date(expense.date).toLocaleDateString()}
                    {expense.careRecipientName && ` • for ${expense.careRecipientName}`}
                  </div>
                </div>
                <div className="font-medium text-primary">${expense.amount.toLocaleString()}</div>
              </div>
            ))}
            <div className="pt-2 text-center">
              <p className="text-xs text-muted-foreground">
                You're doing great! Every expense tracked helps your family's future. 💙
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="mb-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Plus className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-medium text-gray-700 mb-1">Ready to start your journey?</h3>
              <p className="text-sm">Every dollar you track is a step toward financial peace of mind</p>
            </div>
            <Button 
              variant="default" 
              className="bg-primary hover:bg-primary-dark"
              onClick={() => navigate('/expenses/new')}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Expense
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LatestExpenses;
