import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTransactionTriage } from '@/hooks/useTransactionTriage';
import { TransactionCard } from '@/components/transactions/TransactionCard';
import { TransactionDetailsSheet } from '@/components/transactions/TransactionDetailsSheet';
import { Undo, CheckCircle, ArrowLeft, ArrowRight, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const TransactionTriage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const {
    transactions,
    currentTransaction,
    currentIndex,
    loading,
    triageStats,
    hasUndo,
    isComplete,
    handleKeep,
    handleSkip,
    handleUndo,
    fetchTransactions,
    incrementTipsShown,
    shouldShowTips,
    goToPrevious,
    goToNext
  } = useTransactionTriage();

  const [showDetailsSheet, setShowDetailsSheet] = useState(false);
  const [showUndoToast, setShowUndoToast] = useState(false);

  const showUndoNotification = (duration = 7000) => {
    setShowUndoToast(true);
    setTimeout(() => setShowUndoToast(false), duration);
  };

  const onKeepTransaction = async () => {
    if (!currentTransaction) return;

    const result = await handleKeep(currentTransaction);
    if (result && result.expense_id) {
      // Navigate to edit the created expense
      navigate(`/expenses/${result.expense_id}`);
      
      toast({
        title: "Expense created!",
        description: "Review and edit the expense details as needed.",
      });
      
      showUndoNotification();
    }
  };

  const onSkipTransaction = async () => {
    if (!currentTransaction) return;
    
    await handleSkip(currentTransaction);
    showUndoNotification();
  };


  const handleTipsClick = () => {
    incrementTipsShown();
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading transactions...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (isComplete) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 max-w-md">
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            
            <div>
              <h1 className="text-2xl font-bold mb-2">All caught up!</h1>
              <p className="text-muted-foreground">
                Nothing to review—great job. New transactions will appear within a day.
              </p>
            </div>

            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">
                Reviewed today: {triageStats.reviewed_today}
              </div>
              
              <Button 
                onClick={fetchTransactions}
                variant="outline"
                className="w-full"
              >
                Check for new transactions
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Transaction Triage</h1>
          <Badge variant="secondary">
            {triageStats.reviewed_today} of {triageStats.total_to_review} reviewed
          </Badge>
        </div>

        {/* Tips Row */}
        {shouldShowTips && (
          <Card className="p-4 mb-6 bg-blue-50 border-blue-200">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <p className="text-sm text-blue-900">
                  Swipe right ✅ to create expense • Swipe left ❌ to skip • Tap ✏️ for details
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleTipsClick}
                  className="text-blue-700 hover:text-blue-900 h-auto p-0"
                >
                  Got it
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Progress */}
        <div className="text-center mb-6">
          <p className="text-muted-foreground mb-2">
            Review to save deductible medical expenses
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
            <span>{currentIndex + 1} of {transactions.length}</span>
            <div className="w-24 bg-muted rounded-full h-1">
              <div 
                className="bg-primary h-1 rounded-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / transactions.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Transaction Card */}
        {currentTransaction && (
          <div className="mb-6">
            <TransactionCard
              transaction={currentTransaction}
              onKeep={onKeepTransaction}
              onSkip={onSkipTransaction}
              onTapForDetails={() => setShowDetailsSheet(true)}
            />
          </div>
        )}

        {/* Navigation and Undo */}
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={currentIndex === 0}
              onClick={goToPrevious}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={currentIndex >= transactions.length - 1}
              onClick={goToNext}
            >
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          {hasUndo && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleUndo}
              className="text-muted-foreground hover:text-foreground"
            >
              <Undo className="w-4 h-4 mr-2" />
              Undo
            </Button>
          )}
        </div>

        {/* Undo Toast */}
        {showUndoToast && hasUndo && (
          <div className="fixed bottom-4 left-4 right-4 z-50">
            <Card className="p-4 bg-background shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm">Action completed</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleUndo}
                  className="h-auto p-2"
                >
                  <Undo className="w-4 h-4 mr-1" />
                  Undo
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Sheets */}
      <TransactionDetailsSheet
        transaction={currentTransaction}
        isOpen={showDetailsSheet}
        onClose={() => setShowDetailsSheet(false)}
        onKeep={onKeepTransaction}
        onSkip={onSkipTransaction}
      />
    </Layout>
  );
};

export default TransactionTriage;