
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Receipt, Calendar, CreditCard, PenTool } from 'lucide-react';
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

  const isAutoImported = (expense: Expense) => {
    return !!expense.synced_transaction_id;
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[100px]">Date</TableHead>
              <TableHead className="min-w-[150px]">Description</TableHead>
              <TableHead className="hidden sm:table-cell min-w-[100px]">Category</TableHead>
              <TableHead className="hidden md:table-cell min-w-[120px]">Recipient</TableHead>
              <TableHead className="text-right min-w-[80px]">Amount</TableHead>
              <TableHead className="hidden lg:table-cell min-w-[100px]">Status</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.length > 0 ? (
              expenses.map((expense) => (
                <TableRow 
                  key={expense.id} 
                  className={`cursor-pointer hover:bg-muted/50 ${
                    isAutoImported(expense) ? 'bg-blue-50/30 border-l-2 border-l-blue-500' : ''
                  }`}
                  onClick={() => onExpenseClick(expense.id)}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">{new Date(expense.date).toLocaleDateString()}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[200px] space-y-1">
                      <div className="truncate font-medium text-sm">
                        {expense.description || expense.category}
                      </div>
                      <div className="flex items-center space-x-1">
                        {isAutoImported(expense) ? (
                          <Badge variant="secondary" className="text-xs flex items-center">
                            <CreditCard className="h-3 w-3 mr-1" />
                            <span className="hidden sm:inline">Auto-imported</span>
                            <span className="sm:hidden">Auto</span>
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs flex items-center">
                            <PenTool className="h-3 w-3 mr-1" />
                            Manual
                          </Badge>
                        )}
                      </div>
                      <div className="block sm:hidden">
                        <Badge variant="outline" className="text-xs mr-1">
                          {expense.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {getRecipientName(expense.careRecipientId)}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant="outline" className="text-xs">
                      {expense.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm">
                    {getRecipientName(expense.careRecipientId)}
                  </TableCell>
                  <TableCell className="font-semibold text-right">
                    <div className="text-sm sm:text-base">
                      ${expense.amount.toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="flex flex-col gap-1">
                      <div className="flex gap-1 flex-wrap">
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
                      {isAutoImported(expense) && (
                        <div className="text-xs text-blue-600 flex items-center">
                          <CreditCard className="h-3 w-3 mr-1" />
                          Bank sync
                        </div>
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
    </div>
  );
};

export default ExpenseTable;
