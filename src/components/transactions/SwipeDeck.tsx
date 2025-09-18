import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SwipeCard } from './SwipeCard';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react';

import { Transaction } from '@/hooks/useTransactionReview';

interface SwipeDeckProps {
  transactions: Transaction[];
  onKeep: (tx: Transaction) => void;
  onSkip: (tx: Transaction) => void;
  isLoading?: boolean;
}

export function SwipeDeck({ transactions, onKeep, onSkip, isLoading }: SwipeDeckProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animatingCards, setAnimatingCards] = useState<Set<string>>(new Set());

  // Filter to only pending transactions
  const pendingTransactions = transactions.filter(tx => tx.review_status === 'pending');
  
  // Reset index when transactions change
  useEffect(() => {
    setCurrentIndex(0);
  }, [transactions]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (pendingTransactions.length === 0 || currentIndex >= pendingTransactions.length) return;
      
      const currentTransaction = pendingTransactions[currentIndex];
      
      switch (event.key) {
        case 'ArrowLeft':
        case 's':
        case 'S':
          event.preventDefault();
          handleSkip(currentTransaction);
          break;
        case 'ArrowRight':
        case 'k':
        case 'K':
          event.preventDefault();
          handleKeep(currentTransaction);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pendingTransactions, currentIndex]);

  const handleKeep = (transaction: Transaction) => {
    if (animatingCards.has(transaction.id)) return;
    
    setAnimatingCards(prev => new Set(prev).add(transaction.id));
    onKeep(transaction);
    
    // Advance to next card after animation
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setAnimatingCards(prev => {
        const newSet = new Set(prev);
        newSet.delete(transaction.id);
        return newSet;
      });
    }, 300);
  };

  const handleSkip = (transaction: Transaction) => {
    if (animatingCards.has(transaction.id)) return;
    
    setAnimatingCards(prev => new Set(prev).add(transaction.id));
    onSkip(transaction);
    
    // Advance to next card after animation
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setAnimatingCards(prev => {
        const newSet = new Set(prev);
        newSet.delete(transaction.id);
        return newSet;
      });
    }, 300);
  };

  if (isLoading) {
    return (
      <div className="relative w-full h-96 flex items-center justify-center">
        <Card className="w-full h-full">
          <CardContent className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading transactions...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (pendingTransactions.length === 0) {
    return (
      <div className="relative w-full h-96">
        <Card className="w-full h-full">
          <CardContent className="flex items-center justify-center h-full">
            <div className="text-center space-y-4">
              <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto" />
              <div>
                <h3 className="text-lg font-semibold">All caught up!</h3>
                <p className="text-muted-foreground">No pending transactions to review.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentIndex >= pendingTransactions.length) {
    return (
      <div className="relative w-full h-96">
        <Card className="w-full h-full">
          <CardContent className="flex items-center justify-center h-full">
            <div className="text-center space-y-4">
              <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto" />
              <div>
                <h3 className="text-lg font-semibold">Review complete!</h3>
                <p className="text-muted-foreground">
                  You've reviewed all pending transactions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show up to 3 cards in the stack for visual depth
  const visibleCards = pendingTransactions.slice(currentIndex, currentIndex + 3);

  return (
    <div className="relative w-full h-96">
      <AnimatePresence mode="popLayout">
        {visibleCards.map((transaction, stackIndex) => (
          <motion.div
            key={`${transaction.id}-${currentIndex}`}
            initial={{ scale: 0.9, opacity: 0, y: 50 }}
            animate={{ 
              scale: stackIndex === 0 ? 1 : 0.95 - (stackIndex * 0.02),
              opacity: stackIndex === 0 ? 1 : 0.7 - (stackIndex * 0.1),
              y: stackIndex * 8,
              zIndex: 10 - stackIndex
            }}
            exit={{ 
              scale: 1.1, 
              opacity: 0,
              transition: { duration: 0.3 }
            }}
            className="absolute inset-0"
          >
            <SwipeCard
              transaction={transaction}
              onKeep={handleKeep}
              onSkip={handleSkip}
              isTop={stackIndex === 0}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Progress indicator */}
      <div className="absolute -bottom-12 left-0 right-0 flex items-center justify-center gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{currentIndex + 1} of {pendingTransactions.length}</span>
          <div className="w-32 bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${((currentIndex + 1) / pendingTransactions.length) * 100}%` 
              }}
            />
          </div>
        </div>
      </div>

      {/* Keyboard hints */}
      <div className="absolute -bottom-20 left-0 right-0 flex items-center justify-center gap-6 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <ArrowLeft className="w-3 h-3" />
          <span>Skip (S)</span>
        </div>
        <div className="flex items-center gap-1">
          <ArrowRight className="w-3 h-3" />
          <span>Keep (K)</span>
        </div>
      </div>
    </div>
  );
}