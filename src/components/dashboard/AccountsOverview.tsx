import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Banknote, CreditCard, Wallet, PiggyBank, TrendingUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AccountData {
  id: string;
  type: 'checking' | 'card_balance' | 'net_cash' | 'savings' | 'investments';
  name: string;
  balance: number;
  isPositive?: boolean;
}

interface AccountsOverviewProps {
  accounts: AccountData[];
  formatCurrency: (amount: number) => string;
}

const getAccountIcon = (type: AccountData['type']) => {
  switch (type) {
    case 'checking':
      return <Banknote className="h-5 w-5" />;
    case 'card_balance':
      return <CreditCard className="h-5 w-5" />;
    case 'net_cash':
      return <Wallet className="h-5 w-5" />;
    case 'savings':
      return <PiggyBank className="h-5 w-5" />;
    case 'investments':
      return <TrendingUp className="h-5 w-5" />;
    default:
      return <Banknote className="h-5 w-5" />;
  }
};

const getAccountColor = (type: AccountData['type']) => {
  switch (type) {
    case 'checking':
      return 'text-blue-600 bg-blue-100';
    case 'card_balance':
      return 'text-purple-600 bg-purple-100';
    case 'net_cash':
      return 'text-green-600 bg-green-100';
    case 'savings':
      return 'text-orange-600 bg-orange-100';
    case 'investments':
      return 'text-indigo-600 bg-indigo-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

export const AccountsOverview: React.FC<AccountsOverviewProps> = ({
  accounts,
  formatCurrency,
}) => {
  return (
    <Card className="bg-white border-0 shadow-sm mx-4 mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          ACCOUNTS
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {accounts.map((account) => (
          <div key={account.id} className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getAccountColor(account.type)}`}>
                {getAccountIcon(account.type)}
              </div>
              <span className="font-medium text-foreground">{account.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`font-semibold ${
                account.type === 'card_balance' && account.balance > 0 
                  ? 'text-red-600' 
                  : 'text-foreground'
              }`}>
                {account.type === 'card_balance' && account.balance > 0 
                  ? `-${formatCurrency(account.balance)}` 
                  : formatCurrency(account.balance)
                }
              </span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        ))}
        
        <div className="pt-2">
          <Button variant="ghost" className="w-full text-center text-sm text-muted-foreground">
            + Add Account
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};