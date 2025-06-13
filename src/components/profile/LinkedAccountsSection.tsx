
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, CreditCard, Building2, Trash2, RefreshCw, Download } from 'lucide-react';
import { useLinkedAccounts } from '@/hooks/useLinkedAccounts';
import { useSyncedTransactions } from '@/hooks/useSyncedTransactions';
import { LinkedAccount } from '@/types/FinancialAccount';
import AddAccountDialog from './AddAccountDialog';

const LinkedAccountsSection = () => {
  const { accounts, loading, removeAccount } = useLinkedAccounts();
  const { syncAccountTransactions } = useSyncedTransactions();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [syncingAccounts, setSyncingAccounts] = useState<Set<string>>(new Set());

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'bank':
        return <Building2 className="h-4 w-4" />;
      case 'credit_card':
        return <CreditCard className="h-4 w-4" />;
      case 'fsa':
      case 'hsa':
        return <RefreshCw className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  const getAccountBadgeColor = (type: string) => {
    switch (type) {
      case 'bank':
        return 'bg-blue-100 text-blue-800';
      case 'credit_card':
        return 'bg-purple-100 text-purple-800';
      case 'fsa':
        return 'bg-green-100 text-green-800';
      case 'hsa':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSyncTransactions = async (accountId: string) => {
    setSyncingAccounts(prev => new Set(prev).add(accountId));
    try {
      await syncAccountTransactions(accountId);
    } finally {
      setSyncingAccounts(prev => {
        const newSet = new Set(prev);
        newSet.delete(accountId);
        return newSet;
      });
    }
  };

  const canSync = (account: LinkedAccount) => {
    return account.stripe_account_id && account.account_type === 'bank';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Linked Financial Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded-md"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Linked Financial Accounts</CardTitle>
          <p className="text-sm text-gray-500">
            Connect your bank accounts, HSA, and FSA to automatically track qualifying expenses
          </p>
        </CardHeader>
        <CardContent>
          {accounts.length > 0 ? (
            <div className="space-y-3">
              {accounts.map((account) => (
                <div 
                  key={account.id} 
                  className="flex items-center justify-between border rounded-md p-3"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-100 rounded-md">
                      {getAccountIcon(account.account_type)}
                    </div>
                    <div>
                      <h3 className="font-medium">{account.account_name}</h3>
                      <div className="flex items-center space-x-2">
                        <Badge className={getAccountBadgeColor(account.account_type)}>
                          {account.account_type.toUpperCase()}
                        </Badge>
                        {account.institution_name && (
                          <span className="text-sm text-gray-500">{account.institution_name}</span>
                        )}
                        {account.stripe_account_id && (
                          <Badge variant="secondary" className="text-xs">
                            <CreditCard className="h-3 w-3 mr-1" />
                            Auto-sync enabled
                          </Badge>
                        )}
                      </div>
                      {account.last_sync_at && (
                        <p className="text-xs text-gray-400">
                          Last synced: {new Date(account.last_sync_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {canSync(account) && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleSyncTransactions(account.id)}
                        disabled={syncingAccounts.has(account.id)}
                      >
                        {syncingAccounts.has(account.id) ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Download className="h-4 w-4 mr-2" />
                            Sync
                          </>
                        )}
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => removeAccount(account.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              No financial accounts linked yet. Add your first account to start tracking expenses automatically.
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button 
            onClick={() => setShowAddDialog(true)} 
            className="w-full"
            variant="outline"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Link New Account
          </Button>
        </CardFooter>
      </Card>

      <AddAccountDialog 
        open={showAddDialog} 
        onOpenChange={setShowAddDialog}
      />
    </>
  );
};

export default LinkedAccountsSection;
