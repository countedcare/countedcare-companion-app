
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Calculator, TrendingUp } from 'lucide-react';
import { Expense } from '@/types/User';

interface TaxDeductionProgressProps {
  expenses: Expense[];
  annualIncomeThreshold?: number;
}

const TaxDeductionProgress: React.FC<TaxDeductionProgressProps> = ({ 
  expenses, 
  annualIncomeThreshold = 75000 
}) => {
  const currentYear = new Date().getFullYear();
  const yearStart = new Date(currentYear, 0, 1);
  
  const thisYearExpenses = expenses.filter(expense => 
    new Date(expense.date) >= yearStart
  );
  
  const deductibleExpenses = thisYearExpenses.filter(expense => 
    expense.is_tax_deductible
  );
  
  const totalDeductible = deductibleExpenses.reduce((sum, expense) => 
    sum + expense.amount, 0
  );
  
  const autoImportedDeductible = deductibleExpenses
    .filter(expense => expense.synced_transaction_id)
    .reduce((sum, expense) => sum + expense.amount, 0);
  
  // IRS standard: Medical expenses over 7.5% of AGI are deductible
  const agiThreshold = annualIncomeThreshold * 0.075;
  const deductibleAmount = Math.max(0, totalDeductible - agiThreshold);
  const progressPercent = Math.min(100, (totalDeductible / agiThreshold) * 100);
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Calculator className="h-5 w-5 mr-2 text-primary" />
          {currentYear} Tax Deduction Progress
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Track your potential medical expense deductions
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Medical expenses tracked</span>
            <span className="font-medium">${totalDeductible.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>AGI threshold (7.5%)</span>
            <span>${agiThreshold.toLocaleString()}</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>
              {progressPercent < 100 ? 
                `$${(agiThreshold - totalDeductible).toLocaleString()} to reach threshold` :
                'Threshold reached!'
              }
            </span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
        </div>
        
        {deductibleAmount > 0 && (
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center space-x-2 mb-1">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                Potential Deduction: ${deductibleAmount.toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-green-700">
              Based on expenses exceeding 7.5% of your estimated AGI
            </p>
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-4 pt-2 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {deductibleExpenses.length}
            </div>
            <div className="text-xs text-muted-foreground">
              Deductible expenses
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              ${autoImportedDeductible.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">
              Auto-imported
            </div>
          </div>
        </div>
        
        {autoImportedDeductible > 0 && (
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="text-xs">
              Auto-tracking active
            </Badge>
            <span className="text-xs text-muted-foreground">
              {Math.round((autoImportedDeductible / totalDeductible) * 100)}% of deductions auto-captured
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TaxDeductionProgress;
