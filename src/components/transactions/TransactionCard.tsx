import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, CreditCard, MapPin } from 'lucide-react';
import { PlaidTransaction } from '@/hooks/useTransactionTriage';

interface TransactionCardProps {
  transaction: PlaidTransaction;
  onKeep: () => void;
  onSkip: () => void;
  onTapForDetails: () => void;
  showSmartHints?: boolean;
}

export const TransactionCard = ({ 
  transaction, 
  onKeep, 
  onSkip, 
  onTapForDetails,
  showSmartHints = true
}: TransactionCardProps) => {
  
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: transaction.iso_currency_code || 'USD'
    }).format(Math.abs(amount));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
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

  const getSmartHintText = () => {
    const merchant = getMerchantName().toLowerCase();
    
    if (merchant.includes('uber') || merchant.includes('lyft')) {
      return 'Likely: Medical travel';
    }
    if (merchant.includes('pharmacy') || merchant.includes('cvs') || merchant.includes('walgreens')) {
      return 'Likely: Medical expense';
    }
    if (merchant.includes('hospital') || merchant.includes('clinic') || merchant.includes('medical')) {
      return 'Likely: Medical expense';
    }
    
    return 'Not sure yet';
  };

  const getSubtitleText = () => {
    const parts = [];
    const merchant = getMerchantName();
    
    if (merchant) parts.push(merchant);
    if (transaction.category) parts.push(transaction.category);
    
    const date = new Date(transaction.date);
    const timeString = date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
    parts.push(timeString);
    
    return parts.join(' • ');
  };

  return (
    <Card 
      className="w-full max-w-md mx-auto cursor-pointer transition-all duration-200 hover:shadow-lg"
      onClick={onTapForDetails}
    >
      <div className="p-6">
        {/* Header with merchant and amount */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            {/* Merchant logo placeholder */}
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-5 h-5 text-primary" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base truncate">
                {getMerchantName()}
              </h3>
              <p className="text-sm text-muted-foreground truncate">
                {getSubtitleText()}
              </p>
            </div>
          </div>
          
          <div className="text-right flex-shrink-0 ml-4">
            <div className="font-bold text-lg">
              {formatAmount(transaction.amount)}
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="w-3 h-3 mr-1" />
              {formatDate(transaction.authorized_date || transaction.date)}
            </div>
          </div>
        </div>

        {/* Status badge */}
        {transaction.pending && (
          <div className="mb-3">
            <Badge variant="secondary" className="text-xs">
              Pending
            </Badge>
          </div>
        )}

        {/* Smart hints */}
        {showSmartHints && (
          <div className="mb-4 space-y-2">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-xs">
                {getSmartHintText()}
              </Badge>
              <Badge variant="outline" className="text-xs cursor-pointer hover:bg-accent">
                Choose care recipient
              </Badge>
              {(getMerchantName().toLowerCase().includes('uber') || 
                getMerchantName().toLowerCase().includes('lyft')) && (
                <Badge variant="outline" className="text-xs cursor-pointer hover:bg-accent">
                  Recurring?
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Location if available */}
        {transaction.location && Object.keys(transaction.location).length > 0 && (
          <div className="mb-4 flex items-center text-sm text-muted-foreground">
            <MapPin className="w-3 h-3 mr-1" />
            <span className="truncate">
              {transaction.location.city || 'Location available'}
            </span>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex space-x-3 pt-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              onSkip();
            }}
          >
            Skip
          </Button>
          <Button
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              onKeep();
            }}
          >
            Keep
          </Button>
        </div>
      </div>
    </Card>
  );
};