import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, CheckCircle } from 'lucide-react';
import { SwipeDeck } from '@/components/transactions/SwipeDeck';
import { QualifyForm } from '@/components/transactions/QualifyForm';
import { useTransactionReview } from '@/hooks/useTransactionReview';
import { Transaction } from '@/hooks/useTransactionReview';

export function TransactionTriage() {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [qualifyFormOpen, setQualifyFormOpen] = useState(false);

  const {
    transactions,
    isLoading,
    stats,
    skipTransaction,
    keepTransaction
  } = useTransactionReview({ sort: 'newest', filter: 'all' });

  // Mock reviews count - this would be tracked in user preferences or gamification
  const reviewsToday = 5;

  const handleKeep = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setQualifyFormOpen(true);
  };

  const handleSkip = (transaction: Transaction) => {
    skipTransaction(transaction);
  };

  const handleQualifySubmit = async (data: any) => {
    await keepTransaction(data);
    setQualifyFormOpen(false);
    setSelectedTransaction(null);
  };

  if (stats.totalPending === 0) {
    return (
      <div className="px-4">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-900">
              <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
              Transaction Review
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">All caught up!</h3>
            <p className="text-gray-600">No pending transactions to review right now.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="px-4">
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-gray-900">
              <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
              Transaction Triage
            </CardTitle>
            <Badge 
              variant="secondary" 
              className="bg-emerald-100 text-emerald-700 border-emerald-200"
            >
              {reviewsToday} reviewed today
            </Badge>
          </div>
          <p className="text-sm text-gray-600">
            Swipe right ✅ to keep • Swipe left ❌ to skip • Tap ✏️ for details
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-96">
            <SwipeDeck
              transactions={transactions}
              onKeep={handleKeep}
              onSkip={handleSkip}
              isLoading={isLoading}
            />
          </div>
        </CardContent>
      </Card>
      
      <QualifyForm
        open={qualifyFormOpen}
        onOpenChange={setQualifyFormOpen}
        transaction={selectedTransaction}
        onSubmit={handleQualifySubmit}
      />
    </div>
  );
}