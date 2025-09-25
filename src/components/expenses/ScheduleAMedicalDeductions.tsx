import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, Calculator, Info, DollarSign, FileText } from 'lucide-react';
import { Expense } from '@/types/User';
import { useToast } from '@/hooks/use-toast';

interface ScheduleAMedicalDeductionsProps {
  expenses: Expense[];
}

const MEDICAL_CATEGORIES = [
  'Medical',
  'Dental',
  'Vision',
  'Prescription Medications',
  'Medical Equipment',
  'Home Care',
  'Physical Therapy',
  'Mental Health',
  'Alternative Medicine'
];

const ScheduleAMedicalDeductions: React.FC<ScheduleAMedicalDeductionsProps> = ({ expenses }) => {
  const { toast } = useToast();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [adjustedGrossIncome, setAdjustedGrossIncome] = useState<string>('');

  // Filter medical/dental expenses for selected year
  const medicalExpenses = useMemo(() => {
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      const isMedical = MEDICAL_CATEGORIES.some(category => 
        expense.category.toLowerCase().includes(category.toLowerCase())
      );
      return expenseDate.getFullYear() === selectedYear && isMedical;
    });
  }, [expenses, selectedYear]);

  // Calculate totals
  const calculations = useMemo(() => {
    const totalMedicalExpenses = medicalExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const agi = parseFloat(adjustedGrossIncome) || 0;
    const agiThreshold = agi * 0.075; // 7.5% of AGI threshold for 2023+
    const deductibleAmount = Math.max(0, totalMedicalExpenses - agiThreshold);
    
    return {
      totalMedicalExpenses,
      agiThreshold,
      deductibleAmount,
      agi
    };
  }, [medicalExpenses, adjustedGrossIncome]);

  // Group expenses by category
  const expensesByCategory = useMemo(() => {
    const grouped: Record<string, Expense[]> = {};
    medicalExpenses.forEach(expense => {
      if (!grouped[expense.category]) {
        grouped[expense.category] = [];
      }
      grouped[expense.category].push(expense);
    });
    return grouped;
  }, [medicalExpenses]);

  // Get available years
  const availableYears = useMemo(() => {
    const years = [...new Set(expenses.map(exp => new Date(exp.date).getFullYear()))];
    return years.sort((a, b) => b - a);
  }, [expenses]);

  const exportScheduleAData = () => {
    if (!adjustedGrossIncome) {
      toast({
        title: "AGI Required",
        description: "Please enter your Adjusted Gross Income to calculate deductions.",
        variant: "destructive"
      });
      return;
    }

    const scheduleAData = {
      taxYear: selectedYear,
      adjustedGrossIncome: calculations.agi,
      totalMedicalExpenses: calculations.totalMedicalExpenses,
      agiThreshold: calculations.agiThreshold,
      deductibleAmount: calculations.deductibleAmount,
      expenseBreakdown: Object.entries(expensesByCategory).map(([category, exps]) => ({
        category,
        count: exps.length,
        total: exps.reduce((sum, exp) => sum + exp.amount, 0),
        expenses: exps.map(exp => ({
          date: exp.date,
          description: exp.description,
          amount: exp.amount,
          vendor: exp.vendor,
          careRecipient: exp.careRecipientName
        }))
      }))
    };

    // Create CSV for Schedule A
    const csvHeaders = [
      'Schedule A - Medical and Dental Expenses',
      '',
      `Tax Year: ${selectedYear}`,
      `Adjusted Gross Income: $${calculations.agi.toLocaleString()}`,
      `7.5% AGI Threshold: $${calculations.agiThreshold.toLocaleString()}`,
      `Total Medical Expenses: $${calculations.totalMedicalExpenses.toLocaleString()}`,
      `Deductible Amount (Line 4): $${calculations.deductibleAmount.toLocaleString()}`,
      '',
      'Detailed Expense Breakdown:',
      'Date,Category,Description,Amount,Vendor,Care Recipient'
    ];

    const csvRows = medicalExpenses.map(expense => [
      expense.date,
      expense.category,
      expense.description || '',
      expense.amount.toFixed(2),
      expense.vendor || '',
      expense.careRecipientName || ''
    ]);

    const allRows = [...csvHeaders, ...csvRows.map(row => row.join(','))];
    const csvContent = allRows.join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `schedule-a-medical-deductions-${selectedYear}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export Complete",
      description: `Schedule A medical deductions exported for ${selectedYear}. Deductible amount: $${calculations.deductibleAmount.toLocaleString()}`,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calculator className="h-5 w-5 mr-2" />
            Schedule A - Medical & Dental Deductions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Year and AGI Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tax-year">Tax Year</Label>
              <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.map(year => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="agi">Adjusted Gross Income (AGI)</Label>
              <Input
                id="agi"
                type="number"
                placeholder="Enter your AGI"
                value={adjustedGrossIncome}
                onChange={(e) => setAdjustedGrossIncome(e.target.value)}
              />
            </div>
          </div>

          {/* Calculation Results */}
          {medicalExpenses.length > 0 && (
            <>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 text-blue-600 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Medical Expenses</p>
                        <p className="text-2xl font-bold">${calculations.totalMedicalExpenses.toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center">
                      <Info className="h-4 w-4 text-orange-600 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">7.5% AGI Threshold</p>
                        <p className="text-2xl font-bold">${calculations.agiThreshold.toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 text-green-600 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">Deductible Amount</p>
                        <p className="text-2xl font-bold text-green-600">
                          ${calculations.deductibleAmount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Explanation */}
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Medical expenses are deductible only to the extent they exceed 7.5% of your Adjusted Gross Income. 
                  {calculations.deductibleAmount > 0 
                    ? ` You can deduct $${calculations.deductibleAmount.toLocaleString()} on Schedule A, Line 4.`
                    : ` Your medical expenses don't exceed the threshold for ${selectedYear}.`
                  }
                </AlertDescription>
              </Alert>

              {/* Expense Breakdown */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Expense Breakdown by Category</h3>
                <div className="space-y-3">
                  {Object.entries(expensesByCategory).map(([category, categoryExpenses]) => {
                    const categoryTotal = categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0);
                    return (
                      <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Badge variant="secondary">{category}</Badge>
                          <span className="text-sm text-gray-600">
                            {categoryExpenses.length} expense{categoryExpenses.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <span className="font-semibold">${categoryTotal.toLocaleString()}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Export Button */}
              <div className="flex justify-end">
                <Button onClick={exportScheduleAData} className="flex items-center">
                  <Download className="h-4 w-4 mr-2" />
                  Export Schedule A Data
                </Button>
              </div>
            </>
          )}

          {medicalExpenses.length === 0 && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                No medical or dental expenses found for {selectedYear}. 
                Make sure your expenses are categorized correctly.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ScheduleAMedicalDeductions;