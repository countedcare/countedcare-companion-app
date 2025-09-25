import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Expense } from '@/types/User';
import { useToast } from '@/hooks/use-toast';

export function useTaxExport() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const exportTaxData = async (expenses: Expense[], taxYear?: number) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to export data.",
        variant: "destructive"
      });
      return;
    }

    setIsExporting(true);
    
    try {
      // Filter deductible expenses for the specified year
      const year = taxYear || new Date().getFullYear();
      const deductibleExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expense.is_tax_deductible && expenseDate.getFullYear() === year;
      });

      if (deductibleExpenses.length === 0) {
        toast({
          title: "No Data",
          description: `No tax-deductible expenses found for ${year}.`,
          variant: "default"
        });
        setIsExporting(false);
        return;
      }

      // Calculate totals
      const totalDeductible = deductibleExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      const categoryTotals = deductibleExpenses.reduce((acc, exp) => {
        acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
        return acc;
      }, {} as Record<string, number>);

      // Create CSV content
      const csvHeaders = [
        'Date',
        'Amount',
        'Category',
        'Description',
        'Vendor',
        'Care Recipient',
        'Receipt Available',
        'Notes',
        'Reimbursed',
        'Reimbursement Source'
      ];

      const csvRows = deductibleExpenses.map(expense => [
        expense.date,
        expense.amount.toFixed(2),
        expense.category,
        expense.description || '',
        expense.vendor || '',
        expense.careRecipientName || '',
        expense.receiptUrl || expense.receipt_url ? 'Yes' : 'No',
        expense.notes || '',
        expense.is_reimbursed ? 'Yes' : 'No',
        expense.reimbursement_source || ''
      ]);

      // Add summary section
      const summaryRows = [
        [],
        ['SUMMARY'],
        ['Total Deductible Expenses', totalDeductible.toFixed(2)],
        ['Number of Expenses', deductibleExpenses.length.toString()],
        [],
        ['BY CATEGORY'],
        ...Object.entries(categoryTotals).map(([category, total]) => [category, total.toFixed(2)])
      ];

      const allRows = [csvHeaders, ...csvRows, ...summaryRows];
      const csvContent = allRows.map(row => 
        row.map(field => `"${field}"`).join(',')
      ).join('\n');

      // Create and download CSV file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `tax-deductible-expenses-${year}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Also create a detailed JSON export with receipt information
      const detailedExport = {
        exportDate: new Date().toISOString(),
        taxYear: year,
        summary: {
          totalExpenses: deductibleExpenses.length,
          totalAmount: totalDeductible,
          categoryBreakdown: categoryTotals,
          hasReceipts: deductibleExpenses.filter(e => e.receiptUrl || e.receipt_url).length
        },
        expenses: deductibleExpenses.map(expense => ({
          ...expense,
          receiptUrls: expense.receiptUrl ? [expense.receiptUrl] : (expense.receipt_url ? [expense.receipt_url] : [])
        }))
      };

      const jsonBlob = new Blob([JSON.stringify(detailedExport, null, 2)], { 
        type: 'application/json;charset=utf-8;' 
      });
      const jsonLink = document.createElement('a');
      const jsonUrl = URL.createObjectURL(jsonBlob);
      
      jsonLink.setAttribute('href', jsonUrl);
      jsonLink.setAttribute('download', `tax-deductible-expenses-detailed-${year}.json`);
      jsonLink.style.visibility = 'hidden';
      document.body.appendChild(jsonLink);
      jsonLink.click();
      document.body.removeChild(jsonLink);

      toast({
        title: "Export Complete",
        description: `Exported ${deductibleExpenses.length} tax-deductible expenses for ${year}. Downloaded both CSV and detailed JSON files.`,
      });

    } catch (error) {
      console.error('Error exporting tax data:', error);
      toast({
        title: "Export Failed",
        description: "There was an error exporting your tax data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const getReceiptFiles = async (expenses: Expense[]) => {
    const receiptsWithFiles = [];
    
    for (const expense of expenses) {
      if (expense.receiptUrl) {
        try {
          const { data } = await supabase.storage
            .from('receipts')
            .download(expense.receiptUrl);
          
          if (data) {
            receiptsWithFiles.push({
              expenseId: expense.id,
              filename: expense.receiptUrl,
              data: data,
              description: expense.description
            });
          }
        } catch (error) {
          console.error(`Error downloading receipt for expense ${expense.id}:`, error);
        }
      }
      
      if (expense.receipt_url) {
        try {
          const { data } = await supabase.storage
            .from('receipts')
            .download(expense.receipt_url);
          
          if (data) {
            receiptsWithFiles.push({
              expenseId: expense.id,
              filename: expense.receipt_url,
              data: data,
              description: expense.description
            });
          }
        } catch (error) {
          console.error(`Error downloading receipt for expense ${expense.id}:`, error);
        }
      }
    }
    
    return receiptsWithFiles;
  };

  return {
    exportTaxData,
    getReceiptFiles,
    isExporting
  };
}