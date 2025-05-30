
import React from 'react';
import { TrendingUp, Receipt, Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ExpenseSummaryCardProps {
  totalExpenses: number;
  timeFrame: 'month' | 'year';
  setTimeFrame: (value: 'month' | 'year') => void;
  incomeThreshold: number;
  yearlyExpenses: number;
  incomeProgressPercentage: number;
  nextPayday: number;
  formatCurrency: (value: number) => string;
}

const ExpenseSummaryCard = ({
  totalExpenses,
  timeFrame,
  setTimeFrame,
  incomeThreshold,
  yearlyExpenses,
  incomeProgressPercentage,
  nextPayday,
  formatCurrency
}: ExpenseSummaryCardProps) => {
  return (
    <div className="bg-primary rounded-lg p-5 text-white mb-6">
      <div className="mb-4">
        <h2 className="text-xl font-heading">Your caregiving expense summary</h2>
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
  );
};

export default ExpenseSummaryCard;
