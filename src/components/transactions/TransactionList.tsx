import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Check, 
  X, 
  Edit3, 
  Calendar, 
  DollarSign, 
  Building2,
  Clock,
  FileText
} from 'lucide-react';
import { TransactionWithStatus } from '@/hooks/useAllTransactions';
import { formatDistanceToNow } from 'date-fns';

interface TransactionListProps {
  transactions: TransactionWithStatus[];
  loading: boolean;
  onUpdateDecision: (transactionId: string, decision: 'keep' | 'skip') => void;
  onEditAsExpense: (transaction: TransactionWithStatus) => void;
  hasMore: boolean;
  onLoadMore: () => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  loading,
  onUpdateDecision,
  onEditAsExpense,
  hasMore,
  onLoadMore
}) => {
  const getStatusColor = (transaction: TransactionWithStatus) => {
    if (transaction.expense_id) return 'bg-green-100 text-green-800';
    if (transaction.triage_decision === 'keep') return 'bg-blue-100 text-blue-800';
    if (transaction.triage_decision === 'skip') return 'bg-gray-100 text-gray-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  const getStatusText = (transaction: TransactionWithStatus) => {
    if (transaction.expense_id) return 'Saved as Expense';
    if (transaction.triage_decision === 'keep') return 'Kept';
    if (transaction.triage_decision === 'skip') return 'Skipped';
    return 'Needs Review';
  };

  if (loading && transactions.length === 0) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
          <p className="text-gray-500">
            Try adjusting your filters or sync new transactions from your bank.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {transactions.map((transaction) => (
        <Card key={transaction.transaction_id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-medium text-lg">
                    {transaction.merchant_name || transaction.name}
                  </h3>
                  <Badge className={getStatusColor(transaction)}>
                    {getStatusText(transaction)}
                  </Badge>
                  {transaction.is_potential_medical && (
                    <Badge variant="outline" className="text-blue-600 border-blue-200">
                      Medical
                    </Badge>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(transaction.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    ${Math.abs(transaction.amount).toFixed(2)}
                    {transaction.amount < 0 && (
                      <Badge variant="outline" className="text-green-600 border-green-200 text-xs">
                        Refund
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    {transaction.category || 'Uncategorized'}
                  </div>
                  {transaction.triage_created_at && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Reviewed {formatDistanceToNow(new Date(transaction.triage_created_at))} ago
                    </div>
                  )}
                </div>

                {transaction.expense_category && (
                  <div className="text-sm text-green-700 bg-green-50 px-2 py-1 rounded mb-3">
                    Categorized as: {transaction.expense_category}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              {!transaction.triage_decision && (
                <>
                  <Button
                    size="sm"
                    onClick={() => onUpdateDecision(transaction.transaction_id, 'keep')}
                    className="flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Keep
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onUpdateDecision(transaction.transaction_id, 'skip')}
                    className="flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Skip
                  </Button>
                </>
              )}
              
              {transaction.triage_decision && (
                <>
                  <Button
                    size="sm"
                    variant={transaction.triage_decision === 'keep' ? 'outline' : 'default'}
                    onClick={() => onUpdateDecision(
                      transaction.transaction_id, 
                      transaction.triage_decision === 'keep' ? 'skip' : 'keep'
                    )}
                    className="flex items-center gap-2"
                  >
                    {transaction.triage_decision === 'keep' ? (
                      <>
                        <X className="w-4 h-4" />
                        Change to Skip
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        Change to Keep
                      </>
                    )}
                  </Button>
                </>
              )}

              <Button
                size="sm"
                variant="ghost"
                onClick={() => onEditAsExpense(transaction)}
                className="flex items-center gap-2"
              >
                <Edit3 className="w-4 h-4" />
                {transaction.expense_id ? 'Edit Expense' : 'Create Expense'}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {hasMore && (
        <div className="text-center py-4">
          <Button
            variant="outline"
            onClick={onLoadMore}
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Loading...' : 'Load More Transactions'}
          </Button>
        </div>
      )}
    </div>
  );
};