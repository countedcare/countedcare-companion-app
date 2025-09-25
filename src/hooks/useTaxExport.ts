import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Expense } from '@/types/User';
import { useToast } from '@/hooks/use-toast';
import JSZip from 'jszip';
import jsPDF from 'jspdf';

export function useTaxExport() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const createScheduleASummaryPDF = (expenses: Expense[], year: number, totalAmount: number, categoryTotals: Record<string, number>) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(16);
    doc.text('Schedule A Medical Expenses Summary', 20, 20);
    doc.setFontSize(12);
    doc.text(`Tax Year: ${year}`, 20, 30);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 35);
    
    // Schedule A Line 1 Summary
    doc.setFontSize(14);
    doc.text('FOR SCHEDULE A - LINE 1:', 20, 50);
    doc.setFontSize(18);
    doc.text(`Total Medical Expenses: $${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 20, 60);
    
    doc.setFontSize(10);
    doc.text('Enter this amount on Form 1040 Schedule A, Line 1', 20, 70);
    
    // Summary Stats
    doc.setFontSize(12);
    doc.text('Summary:', 20, 85);
    doc.text(`• Total Expenses: ${expenses.length}`, 25, 95);
    doc.text(`• With Receipts: ${expenses.filter(e => e.receiptUrl || e.receipt_url).length}`, 25, 105);
    doc.text(`• Date Range: ${new Date(Math.min(...expenses.map(e => new Date(e.date).getTime()))).toLocaleDateString()} - ${new Date(Math.max(...expenses.map(e => new Date(e.date).getTime()))).toLocaleDateString()}`, 25, 115);
    
    // Category Breakdown
    doc.text('Breakdown by Category:', 20, 135);
    let yPos = 145;
    Object.entries(categoryTotals).forEach(([category, total]) => {
      doc.text(`• ${category}: $${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 25, yPos);
      yPos += 10;
    });
    
    // Important Notes
    yPos += 20;
    doc.setFontSize(10);
    doc.text('IMPORTANT NOTES:', 20, yPos);
    yPos += 10;
    doc.text('• Keep all receipts and documentation for your records', 25, yPos);
    yPos += 8;
    doc.text('• Medical expenses are deductible only to the extent they exceed 7.5% of your AGI', 25, yPos);
    yPos += 8;
    doc.text('• Consult IRS Publication 502 for complete list of qualifying expenses', 25, yPos);
    yPos += 8;
    doc.text('• This summary is for informational purposes only - consult a tax professional', 25, yPos);
    
    return doc;
  };

  const downloadReceiptsAsZip = async (expenses: Expense[], year: number) => {
    const zip = new JSZip();
    const receiptsFolder = zip.folder(`${year}-medical-receipts`);
    
    let receiptCount = 0;
    
    for (const expense of expenses) {
      const receiptUrls = [];
      if (expense.receiptUrl) receiptUrls.push(expense.receiptUrl);
      if (expense.receipt_url) receiptUrls.push(expense.receipt_url);
      if (expense.receiptUrls && Array.isArray(expense.receiptUrls)) receiptUrls.push(...expense.receiptUrls);
      
      for (const receiptUrl of receiptUrls) {
        try {
          const { data } = await supabase.storage
            .from('receipts')
            .download(receiptUrl);
          
          if (data) {
            const fileExtension = receiptUrl.split('.').pop() || 'jpg';
            const fileName = `${expense.date}_${expense.category.replace(/[^a-zA-Z0-9]/g, '_')}_${expense.amount}_${receiptCount + 1}.${fileExtension}`;
            receiptsFolder?.file(fileName, data);
            receiptCount++;
          }
        } catch (error) {
          console.error(`Error downloading receipt: ${receiptUrl}`, error);
        }
      }
    }
    
    if (receiptCount > 0) {
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(zipBlob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `medical-receipts-${year}.zip`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      return receiptCount;
    }
    
    return 0;
  };

  const exportTaxData = async (expenses: Expense[], taxYear?: number, format: 'all' | 'pdf' | 'csv' | 'receipts' = 'all') => {
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

      let downloadCount = 0;
      let receiptsDownloaded = 0;

      // Create Schedule A Summary PDF
      if (format === 'all' || format === 'pdf') {
        const pdf = createScheduleASummaryPDF(deductibleExpenses, year, totalDeductible, categoryTotals);
        pdf.save(`schedule-a-medical-expenses-${year}.pdf`);
        downloadCount++;
      }

      // Create CSV file
      if (format === 'all' || format === 'csv') {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `medical-expenses-detailed-${year}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        downloadCount++;
      }

      // Download receipts as ZIP
      if (format === 'all' || format === 'receipts') {
        receiptsDownloaded = await downloadReceiptsAsZip(deductibleExpenses, year);
        if (receiptsDownloaded > 0) downloadCount++;
      }

      // Also create a detailed JSON export with receipt information for all formats
      if (format === 'all') {
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
        jsonLink.setAttribute('download', `medical-expenses-backup-${year}.json`);
        jsonLink.style.visibility = 'hidden';
        document.body.appendChild(jsonLink);
        jsonLink.click();
        document.body.removeChild(jsonLink);
        downloadCount++;
      }

      const formatNames = {
        'all': `Complete tax package (${downloadCount} files)`,
        'pdf': 'Schedule A summary PDF',
        'csv': 'Detailed CSV',
        'receipts': `Receipt bundle (${receiptsDownloaded} receipts)`
      };

      toast({
        title: "Export Complete",
        description: `Downloaded ${formatNames[format]} for ${year}. Total medical expenses: $${totalDeductible.toLocaleString()}.`,
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
    downloadReceiptsAsZip,
    isExporting
  };
}