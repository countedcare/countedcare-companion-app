import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface SpendingSummaryHeaderProps {
  currentSpend: number;
  budgetAmount?: number;
  timeFrame: 'month' | 'year';
  onTimeFrameChange: (timeFrame: 'month' | 'year') => void;
  formatCurrency: (amount: number) => string;
}

export const SpendingSummaryHeader: React.FC<SpendingSummaryHeaderProps> = ({
  currentSpend,
  budgetAmount = 0,
  timeFrame,
  onTimeFrameChange,
  formatCurrency,
}) => {
  const budgetDifference = budgetAmount - currentSpend;
  const isUnderBudget = budgetDifference > 0;
  const timeFrameLabel = timeFrame === 'month' ? 'this month' : 'this year';

  return (
    <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-0 shadow-lg mx-4 mt-4">
      <div className="p-6 text-center">
        <p className="text-sm text-muted-foreground mb-1">
          Current spend {timeFrameLabel}
        </p>
        
        <div className="text-4xl font-bold text-foreground mb-3">
          {formatCurrency(currentSpend)}
        </div>
        
        {budgetAmount > 0 && (
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
              isUnderBudget 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {isUnderBudget ? (
                <TrendingDown className="h-3 w-3" />
              ) : (
                <TrendingUp className="h-3 w-3" />
              )}
              {formatCurrency(Math.abs(budgetDifference))} {isUnderBudget ? 'below' : 'over'} budget
            </div>
          </div>
        )}
        
        <div className="flex justify-center gap-2">
          <Button
            variant={timeFrame === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onTimeFrameChange('month')}
            className="min-w-[80px]"
          >
            This Month
          </Button>
          <Button
            variant={timeFrame === 'year' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onTimeFrameChange('year')}
            className="min-w-[80px]"
          >
            This Year
          </Button>
        </div>
        
        {budgetAmount > 0 && (
          <Button variant="ghost" size="sm" className="mt-3 text-muted-foreground">
            BUDGET
          </Button>
        )}
      </div>
    </Card>
  );
};