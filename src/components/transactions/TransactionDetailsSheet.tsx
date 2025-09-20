import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, CreditCard, MapPin, Building2 } from 'lucide-react';
import { PlaidTransaction } from '@/hooks/useTransactionTriage';

interface TransactionDetailsSheetProps {
  transaction: PlaidTransaction | null;
  isOpen: boolean;
  onClose: () => void;
  onKeep: () => void;
  onSkip: () => void;
}

export const TransactionDetailsSheet = ({
  transaction,
  isOpen,
  onClose,
  onKeep,
  onSkip
}: TransactionDetailsSheetProps) => {
  if (!transaction) return null;

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: transaction.iso_currency_code || 'USD'
    }).format(Math.abs(amount));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getMerchantName = () => {
    return transaction.merchant_name || parseMerchantFromName(transaction.name);
  };

  const parseMerchantFromName = (name: string) => {
    return name
      .replace(/^(SQ \*|TST\*|PAYPAL \*|SP \*)/i, '')
      .replace(/\s+\d{4}$/, '')
      .trim();
  };

  const getLocationString = () => {
    if (!transaction.location || Object.keys(transaction.location).length === 0) {
      return null;
    }
    
    const loc = transaction.location;
    const parts = [];
    
    if (loc.address) parts.push(loc.address);
    if (loc.city) parts.push(loc.city);
    if (loc.region) parts.push(loc.region);
    if (loc.postal_code) parts.push(loc.postal_code);
    
    return parts.join(', ') || null;
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="max-h-[80vh]">
        <SheetHeader className="space-y-4">
          <SheetTitle className="text-left">Transaction Details</SheetTitle>
          <SheetDescription className="text-left">
            Review the complete transaction information before deciding.
          </SheetDescription>
        </SheetHeader>

        <div className="py-6 space-y-6">
          {/* Amount and Status */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">
                {formatAmount(transaction.amount)}
              </div>
              <div className="text-sm text-muted-foreground">
                {transaction.iso_currency_code || 'USD'}
              </div>
            </div>
            {transaction.pending && (
              <Badge variant="secondary">Pending</Badge>
            )}
          </div>

          <Separator />

          {/* Transaction Details */}
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Building2 className="w-5 h-5 mt-0.5 text-muted-foreground" />
              <div>
                <div className="font-medium">{getMerchantName()}</div>
                <div className="text-sm text-muted-foreground">
                  {transaction.name}
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Calendar className="w-5 h-5 mt-0.5 text-muted-foreground" />
              <div>
                <div className="font-medium">
                  {formatDate(transaction.authorized_date || transaction.date)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Transaction date
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <CreditCard className="w-5 h-5 mt-0.5 text-muted-foreground" />
              <div>
                <div className="font-medium">
                  Account •••• {transaction.account_id.slice(-4)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {transaction.payment_channel || 'Payment method'}
                </div>
              </div>
            </div>

            {getLocationString() && (
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 mt-0.5 text-muted-foreground" />
                <div>
                  <div className="font-medium">Location</div>
                  <div className="text-sm text-muted-foreground">
                    {getLocationString()}
                  </div>
                </div>
              </div>
            )}

            {transaction.category && (
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 mt-0.5 rounded-full bg-primary/10 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                </div>
                <div>
                  <div className="font-medium">Category</div>
                  <div className="text-sm text-muted-foreground">
                    {transaction.category}
                    {transaction.subcategory && ` • ${transaction.subcategory}`}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex space-x-3 pt-4 border-t">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onSkip}
          >
            Skip
          </Button>
          <Button
            className="flex-1"
            onClick={onKeep}
          >
            Keep
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};