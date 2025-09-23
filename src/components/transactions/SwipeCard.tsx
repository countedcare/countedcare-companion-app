import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, DollarSign, Store, X, Check } from 'lucide-react';
import { format } from 'date-fns';

import { Transaction } from '@/hooks/useTransactionReview';

interface SwipeCardProps {
  transaction: Transaction;
  onKeep: (tx: Transaction) => void;
  onSkip: (tx: Transaction) => void;
  isTop?: boolean;
}

const SWIPE_THRESHOLD = 120;

export function SwipeCard({ transaction, onKeep, onSkip, isTop = false }: SwipeCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 300], [-15, 15]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);
  
  // Color transforms for visual feedback
  const keepColor = useTransform(x, [0, SWIPE_THRESHOLD], [0, 1]);
  const skipColor = useTransform(x, [-SWIPE_THRESHOLD, 0], [1, 0]);

  const handleDragEnd = (event: PointerEvent, info: PanInfo) => {
    const offset = info.offset.x;
    
    if (offset > SWIPE_THRESHOLD) {
      // Swipe right - keep
      onKeep(transaction);
    } else if (offset < -SWIPE_THRESHOLD) {
      // Swipe left - skip
      onSkip(transaction);
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <motion.div
      className={`absolute inset-0 cursor-grab active:cursor-grabbing ${
        isTop ? 'z-10' : 'z-0'
      }`}
      style={{ 
        x,
        rotate: isTop ? rotate : 0,
        opacity: isTop ? 1 : 0.8,
        scale: isTop ? 1 : 0.95
      }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.05 }}
      animate={{ x: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* Keep indicator */}
      <motion.div
        className="absolute top-4 right-4 z-20 flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700"
        style={{ opacity: keepColor }}
      >
        <Check className="w-4 h-4" />
        <span className="font-medium">Create Expense</span>
      </motion.div>

      {/* Skip indicator */}
      <motion.div
        className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-700"
        style={{ opacity: skipColor }}
      >
        <X className="w-4 h-4" />
        <span className="font-medium">Skip</span>
      </motion.div>

      <Card className="w-full h-full border-2 hover:shadow-lg transition-shadow">
        <CardContent className="p-6 h-full flex flex-col justify-between">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">
                  {format(new Date(transaction.date), 'MMM d, yyyy')}
                </span>
              </div>
              <div className="flex items-center gap-2 font-semibold text-lg">
                <DollarSign className="w-5 h-5" />
                {formatAmount(transaction.amount)}
              </div>
            </div>

            {/* Merchant & Description */}
            <div className="space-y-2">
              {transaction.merchant_name && (
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{transaction.merchant_name}</span>
                </div>
              )}
              <p className="text-sm text-muted-foreground line-clamp-2">
                {transaction.description}
              </p>
            </div>

            {/* Category Badge */}
            {transaction.category && (
              <div className="flex gap-2">
                <Badge 
                  variant={transaction.is_potential_medical ? "default" : "secondary"}
                  className={transaction.is_potential_medical ? "bg-blue-100 text-blue-800" : ""}
                >
                  {transaction.category}
                </Badge>
                {transaction.is_potential_medical && (
                  <Badge variant="outline" className="text-emerald-600 border-emerald-200">
                    Medical Candidate
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Desktop Actions */}
          <div className="flex gap-3 md:hidden lg:flex mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSkip(transaction)}
              className="flex-1"
            >
              <X className="w-4 h-4 mr-2" />
              Skip
            </Button>
            <Button
              size="sm"
              onClick={() => onKeep(transaction)}
              className="flex-1"
            >
              <Check className="w-4 h-4 mr-2" />
              Create Expense
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
