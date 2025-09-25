import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, FileText, Calculator, FileArchive, Receipt } from 'lucide-react';
import { Expense } from '@/types/User';
import { useTaxExport } from '@/hooks/useTaxExport';

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

  const handleExport = (format: 'all' | 'pdf' | 'csv' | 'receipts' = 'all') => {
    exportTaxData(expenses, year, format);
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
          Tax Export
        </CardTitle>
        <CardDescription>
          Export your tax-deductible expenses with receipts for tax preparation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
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
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-2">For Schedule A Line 1:</h4>
            <p className="text-2xl font-bold text-green-800">
              ${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-green-700 mt-1">
              Enter this amount on Form 1040 Schedule A, Line 1 (Medical and Dental Expenses)
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button 
              onClick={() => handleExport('pdf')}
              disabled={isExporting || yearExpenses.length === 0}
              variant="outline"
            >
              <FileText className="h-4 w-4 mr-2" />
              Schedule A Summary
            </Button>
            
            <Button 
              onClick={() => handleExport('receipts')}
              disabled={isExporting || yearExpenses.length === 0}
              variant="outline"
            >
              <FileArchive className="h-4 w-4 mr-2" />
              All Receipts
            </Button>
            
            <Button 
              onClick={() => handleExport('csv')}
              disabled={isExporting || yearExpenses.length === 0}
              variant="outline"
            >
              <Receipt className="h-4 w-4 mr-2" />
              Detailed List
            </Button>
            
            <Button 
              onClick={() => handleExport('all')}
              disabled={isExporting || yearExpenses.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Complete Package
            </Button>
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <p><strong>Schedule A Summary:</strong> Clean PDF for tax filing</p>
            <p><strong>All Receipts:</strong> ZIP file with all receipt images</p>
            <p><strong>Detailed List:</strong> CSV with full expense details</p>
            <p><strong>Complete Package:</strong> All files above + backup data</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}