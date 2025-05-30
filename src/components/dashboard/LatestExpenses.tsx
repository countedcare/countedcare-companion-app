
import React from 'react';
import { ArrowRight } from 'lucide-react';
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
  );
};

export default LatestExpenses;
