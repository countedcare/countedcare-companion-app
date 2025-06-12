
import React from 'react';
import { TrendingUp, Receipt, Info, Star, Trophy, Heart } from 'lucide-react';
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

  // Get encouraging message based on progress
  const getProgressMessage = () => {
    if (totalExpenses === 0) {
      return { 
        text: "Ready to start tracking? Every dollar counts! 💙", 
        icon: Heart,
        color: "text-blue-600" 
      };
    }
    if (totalExpenses < 100) {
      return { 
        text: "You're off to a great start! Keep it up! ✨", 
        icon: Star,
        color: "text-green-600" 
      };
    }
    if (incomeProgressPercentage < 25) {
      return { 
        text: "Building your record beautifully! 🌱", 
        icon: TrendingUp,
        color: "text-green-600" 
      };
    }
    if (incomeProgressPercentage < 75) {
      return { 
        text: "You're making real progress! Way to go! 🎯", 
        icon: Trophy,
        color: "text-blue-600" 
      };
    }
    return { 
      text: "Amazing! You're close to the tax threshold! 🎉", 
      icon: Trophy,
      color: "text-purple-600" 
    };
  };

  const progressMessage = getProgressMessage();
  const ProgressIcon = progressMessage.icon;

  // Get payday message
  const getPaydayMessage = () => {
    if (nextPayday <= 3) {
      return `Payday in ${nextPayday} ${nextPayday === 1 ? 'day' : 'days'}! 🎉`;
    }
    if (nextPayday <= 7) {
      return `Payday is coming up (${nextPayday} days) 📅`;
    }
    return `Next payday: ${nextPayday} days away`;
  };

  return (
    <div className="bg-gradient-to-br from-primary to-primary-dark rounded-lg p-5 text-white mb-6 shadow-lg">
      <div className="mb-4">
        <h2 className="text-xl font-heading">Your caregiving expenses</h2>
        <p className="text-blue-100 text-sm">Every dollar you track is a dollar working for you</p>
      </div>
      
      <Card className="bg-white text-foreground shadow-md">
        <CardContent className="p-4">
          <div className="flex flex-col">
            <div className="flex justify-between items-center mb-3">
              <div>
                <p className="text-sm text-muted-foreground">You've tracked this {timeFrame}</p>
                <h2 className="text-3xl font-bold mt-1 text-primary">{formatCurrency(totalExpenses)}</h2>
                
                {/* Encouraging message */}
                <div className={`flex items-center mt-2 ${progressMessage.color}`}>
                  <ProgressIcon className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">{progressMessage.text}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  <span>{formatCurrency(incomeThreshold - yearlyExpenses)} to tax threshold</span>
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
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <span className="text-sm font-medium">Tax Deduction Progress</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 ml-1 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Expenses over 7.5% of your income may qualify for tax deductions</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <span className="text-sm text-muted-foreground font-medium">
                  {incomeProgressPercentage.toFixed(0)}% there!
                </span>
              </div>
              <Progress 
                value={incomeProgressPercentage} 
                className="h-3 transition-all duration-700 ease-out" 
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Current: {formatCurrency(yearlyExpenses)}</span>
                <span>Goal: {formatCurrency(incomeThreshold)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 pt-3 border-t">
              <div className="flex items-center">
                <div className="bg-green-100 text-green-800 p-1 rounded">
                  <Receipt className="h-4 w-4" />
                </div>
                <div className="ml-2">
                  <p className="text-sm font-medium">{getPaydayMessage()}</p>
                  <p className="text-xs text-muted-foreground">Perfect time to catch up on expenses</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpenseSummaryCard;
