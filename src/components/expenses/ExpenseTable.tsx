
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Receipt, Calendar } from 'lucide-react';
import { Expense, CareRecipient } from '@/types/User';

interface ExpenseTableProps {
  expenses: Expense[];
  recipients: CareRecipient[];
  onExpenseClick: (expenseId: string) => void;
}

const ExpenseTable: React.FC<ExpenseTableProps> = ({ expenses, recipients, onExpenseClick }) => {
  const getRecipientName = (careRecipientId: string) => {
    if (careRecipientId === 'self') return 'Self';
    const recipient = recipients.find(r => r.id === careRecipientId);
    return recipient?.name || 'Unknown';
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Recipient</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.length > 0 ? (
            expenses.map((expense) => (
              <TableRow 
                key={expense.id} 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onExpenseClick(expense.id)}
              >
                <TableCell className="font-medium">
                  {new Date(expense.date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="max-w-[200px] truncate">
                    {expense.description || expense.category}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {expense.category}
                  </Badge>
                </TableCell>
                <TableCell>{getRecipientName(expense.careRecipientId)}</TableCell>
                <TableCell className="font-semibold">
                  ${expense.amount.toLocaleString()}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {expense.is_tax_deductible && (
                      <Badge variant="secondary" className="text-xs">
                        Tax Deductible
                      </Badge>
                    )}
                    {expense.is_reimbursed && (
                      <Badge variant="default" className="text-xs">
                        Reimbursed
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {expense.receiptUrl && (
                    <Receipt className="h-4 w-4 text-primary" />
                  )}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                No expenses found matching your filters
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ExpenseTable;
