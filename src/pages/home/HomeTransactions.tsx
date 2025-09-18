import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { SwipeDeck } from '@/components/transactions/SwipeDeck';
import { QualifyForm } from '@/components/transactions/QualifyForm';
import { TopFilters } from '@/components/transactions/TopFilters';
import { useTransactionReview } from '@/hooks/useTransactionReview';

import { Transaction } from '@/hooks/useTransactionReview';

export function HomeTransactions() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [qualifyFormOpen, setQualifyFormOpen] = useState(false);

  const sort = searchParams.get('sort') || 'newest';
  const filter = searchParams.get('filter') || 'all';

  const {
    transactions,
    isLoading,
    stats,
    syncTransactions,
    skipTransaction,
    keepTransaction,
    isSyncing
  } = useTransactionReview({ sort, filter });

  const updateSearchParam = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set(key, value);
    setSearchParams(newParams);
  };

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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Review Bank Transactions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <TopFilters
            sort={sort}
            setSort={(value) => updateSearchParam('sort', value)}
            filter={filter}
            setFilter={(value) => updateSearchParam('filter', value)}
            onSync={() => syncTransactions(30)}
            isSyncing={isSyncing}
            totalPending={stats.totalPending}
            totalCandidates={stats.totalCandidates}
            linkedAccountsCount={stats.linkedAccountsCount}
          />

          <div className="mt-8">
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