import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Calendar, DollarSign, User, MapPin, FileText, Tag, 
  Receipt, Edit, Trash2, Star, CreditCard, PenTool
} from 'lucide-react';
import { Expense, CareRecipient } from '@/types/User';
import { format } from 'date-fns';
import ReceiptViewer from './ReceiptViewer';
import { cn } from '@/lib/utils';

interface ExpenseDetailsModalProps {
  expense: Expense | null;
  recipients: CareRecipient[];
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (expenseId: string) => void;
  onDelete?: (expenseId: string) => void;
}

const ExpenseDetailsModal: React.FC<ExpenseDetailsModalProps> = ({
  expense,
  recipients,
  isOpen,
  onClose,
  onEdit,
  onDelete
}) => {
  if (!expense) return null;

  const getRecipientName = (careRecipientId: string) => {
    if (careRecipientId === 'self') return 'Self';
    const recipient = recipients.find(r => r.id === careRecipientId);
    return recipient?.name || 'Unknown';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const isAutoImported = !!expense.synced_transaction_id;
  const receipts = expense.receiptUrls || (expense.receiptUrl ? [expense.receiptUrl] : []);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Expense Details</span>
            <div className="flex items-center space-x-2">
              {onEdit && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(expense.id)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              )}
              {onDelete && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onDelete(expense.id)}
                >
                  <Trash2 className="h-4 w-4 mr-1 text-destructive" />
                </Button>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold">{expense.description || expense.category}</h3>
                  <p className="text-2xl font-bold text-primary mt-1">
                    {formatCurrency(expense.amount)}
                  </p>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <Badge variant="outline" className="text-xs">
                    {expense.category}
                  </Badge>
                  {isAutoImported ? (
                    <Badge variant="secondary" className="text-xs flex items-center">
                      <CreditCard className="h-3 w-3 mr-1" />
                      Auto-imported
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs flex items-center">
                      <PenTool className="h-3 w-3 mr-1" />
                      Manual
                    </Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{format(new Date(expense.date), 'MMM d, yyyy')}</span>
                </div>
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{getRecipientName(expense.careRecipientId || '')}</span>
                </div>
                {expense.vendor && (
                  <div className="flex items-center col-span-2">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{expense.vendor}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Status Badges */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status & Classifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {expense.is_tax_deductible && (
                  <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
                    <Star className="h-3 w-3 mr-1 fill-current" />
                    Tax Deductible
                  </Badge>
                )}
                {expense.is_reimbursed && (
                  <Badge className="bg-green-100 text-green-800">
                    Reimbursed
                  </Badge>
                )}
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-xs",
                    expense.triage_status === 'kept' && "bg-green-50 border-green-200 text-green-700",
                    expense.triage_status === 'skipped' && "bg-gray-50 border-gray-200 text-gray-700",
                    expense.triage_status === 'pending' && "bg-yellow-50 border-yellow-200 text-yellow-700"
                  )}
                >
                  Status: {expense.triage_status || 'pending'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Receipts */}
          {receipts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center">
                  <Receipt className="h-4 w-4 mr-2" />
                  Receipts ({receipts.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ReceiptViewer 
                  receipts={receipts}
                  trigger={
                    <Button variant="outline" className="w-full">
                      <Receipt className="h-4 w-4 mr-2" />
                      View Receipts ({receipts.length})
                    </Button>
                  }
                />
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {expense.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {expense.notes}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Transaction Info */}
          {isAutoImported && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Transaction Details
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p className="text-muted-foreground">
                  This expense was automatically imported from your connected bank account.
                </p>
                {expense.synced_transaction_id && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Transaction ID: {expense.synced_transaction_id}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created:</span>
                <span>{expense.created_at ? format(new Date(expense.created_at), 'MMM d, yyyy h:mm a') : 'Unknown'}</span>
              </div>
              {expense.updated_at && expense.updated_at !== expense.created_at && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Updated:</span>
                  <span>{format(new Date(expense.updated_at), 'MMM d, yyyy h:mm a')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Source:</span>
                <span>{isAutoImported ? 'Bank Import' : 'Manual Entry'}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExpenseDetailsModal;