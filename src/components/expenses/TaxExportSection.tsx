import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, FileText, Calculator, Receipt } from 'lucide-react';
import { Expense } from '@/types/User';
import { useTaxExport } from '@/hooks/useTaxExport';
import ScheduleAMedicalDeductions from './ScheduleAMedicalDeductions';

interface TaxExportSectionProps {
  expenses: Expense[];
}

export function TaxExportSection({ expenses }: TaxExportSectionProps) {
  const { exportTaxData, isExporting } = useTaxExport();
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());

  // Get available years from expenses
  const availableYears = Array.from(
    new Set(
      expenses
        .filter(e => e.is_tax_deductible)
        .map(e => new Date(e.date).getFullYear())
    )
  ).sort((a, b) => b - a);

  // Calculate stats for selected year
  const year = parseInt(selectedYear);
  const yearExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expense.is_tax_deductible && expenseDate.getFullYear() === year;
  });

  const totalAmount = yearExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const withReceipts = yearExpenses.filter(e => e.receiptUrl || e.receipt_url).length;

  const handleExport = () => {
    exportTaxData(expenses, year);
  };

  if (availableYears.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Tax Export
          </CardTitle>
          <CardDescription>
            Export your tax-deductible expenses for tax preparation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Calculator className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              No tax-deductible expenses found. Mark expenses as tax-deductible to enable export.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Tax Preparation Tools
        </CardTitle>
        <CardDescription>
          Calculate medical deductions and export tax data for your caregiving expenses
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="schedule-a" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="schedule-a" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Schedule A Medical
            </TabsTrigger>
            <TabsTrigger value="general-export" className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              General Export
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="schedule-a" className="mt-6">
            <ScheduleAMedicalDeductions expenses={expenses} />
          </TabsContent>
          
          <TabsContent value="general-export" className="mt-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tax Year</label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tax year" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableYears.map(year => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {yearExpenses.length > 0 && (
                <div className="grid grid-cols-3 gap-4 p-4 border rounded-lg bg-muted/50">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {yearExpenses.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Expenses</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      ${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Amount</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {withReceipts}
                    </div>
                    <div className="text-sm text-muted-foreground">With Receipts</div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  <p className="mb-2">Export includes:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>CSV file compatible with tax software</li>
                    <li>Detailed JSON file with receipt information</li>
                    <li>Summary by category</li>
                    <li>Receipt availability status</li>
                    <li>Reimbursement tracking</li>
                  </ul>
                </div>

                <Button 
                  onClick={handleExport}
                  disabled={isExporting || yearExpenses.length === 0}
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {isExporting ? 'Exporting...' : `Export ${selectedYear} Tax Data`}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}