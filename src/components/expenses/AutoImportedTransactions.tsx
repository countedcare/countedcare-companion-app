
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Check, X, Edit, CreditCard, TrendingUp } from 'lucide-react';
import { SyncedTransaction } from '@/types/FinancialAccount';
import { EXPENSE_CATEGORIES } from '@/types/User';

interface AutoImportedTransactionsProps {
  transactions: SyncedTransaction[];
  onConfirmTransaction: (transactionId: string, expenseData: any) => void;
  onExcludeTransaction: (transactionId: string) => void;
  onEditTransaction: (transactionId: string, updates: Partial<SyncedTransaction>) => void;
}

const AutoImportedTransactions: React.FC<AutoImportedTransactionsProps> = ({
  transactions,
  onConfirmTransaction,
  onExcludeTransaction,
  onEditTransaction
}) => {
  const [editingTransaction, setEditingTransaction] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, any>>({});

  const handleStartEdit = (transaction: SyncedTransaction) => {
    setEditingTransaction(transaction.id);
    setEditValues({
      description: transaction.description,
      category: transaction.category || '',
      is_tax_deductible: transaction.is_tax_deductible ?? true,
      amount: Math.abs(transaction.amount) // Show as positive for editing
    });
  };

  const handleSaveEdit = (transactionId: string) => {
    onEditTransaction(transactionId, editValues);
    setEditingTransaction(null);
    setEditValues({});
  };

  const handleConfirm = (transaction: SyncedTransaction) => {
    const expenseData = {
      amount: Math.abs(transaction.amount),
      description: transaction.description,
      date: transaction.date,
      category: transaction.category || 'Other',
      is_tax_deductible: transaction.is_tax_deductible ?? true,
      synced_transaction_id: transaction.id,
      careRecipientId: 'self' // Default to self, user can change later
    };
    onConfirmTransaction(transaction.id, expenseData);
  };

  const getSuggestedCategory = (description: string, merchantName?: string) => {
    const text = `${description} ${merchantName || ''}`.toLowerCase();
    
    if (text.includes('pharmacy') || text.includes('cvs') || text.includes('walgreens') || text.includes('medical') || text.includes('doctor') || text.includes('hospital')) {
      return 'Medical Care';
    }
    if (text.includes('uber') || text.includes('lyft') || text.includes('taxi') || text.includes('gas') || text.includes('fuel')) {
      return 'Transportation';
    }
    if (text.includes('grocery') || text.includes('food') || text.includes('meal')) {
      return 'Other';
    }
    if (text.includes('care') || text.includes('nursing') || text.includes('aide')) {
      return 'In-Home Care';
    }
    
    return 'Other';
  };

  const pendingTransactions = transactions.filter(t => !t.is_confirmed_medical && !t.expense_id);

  if (pendingTransactions.length === 0) {
    return null;
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <CreditCard className="h-5 w-5 mr-2 text-primary" />
          Review Auto-Imported Transactions
          <Badge variant="secondary" className="ml-2">
            {pendingTransactions.length} pending
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          We've found transactions that might be caregiving expenses. Review and confirm which ones to track.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {pendingTransactions.map((transaction) => (
          <div key={transaction.id} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="font-medium">
                    ${Math.abs(transaction.amount).toLocaleString()}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    Auto-imported
                  </Badge>
                  {transaction.is_potential_medical && (
                    <Badge variant="secondary" className="text-xs">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Likely Medical
                    </Badge>
                  )}
                </div>
                
                {editingTransaction === transaction.id ? (
                  <div className="space-y-3">
                    <Input
                      value={editValues.description || ''}
                      onChange={(e) => setEditValues(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Description"
                      className="text-sm"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="number"
                        value={editValues.amount || ''}
                        onChange={(e) => setEditValues(prev => ({ ...prev, amount: parseFloat(e.target.value) }))}
                        placeholder="Amount"
                        className="text-sm"
                      />
                      <Select 
                        value={editValues.category || ''} 
                        onValueChange={(value) => setEditValues(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger className="text-sm">
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                          {EXPENSE_CATEGORIES.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`tax-${transaction.id}`}
                        checked={editValues.is_tax_deductible ?? true}
                        onCheckedChange={(checked) => setEditValues(prev => ({ ...prev, is_tax_deductible: checked }))}
                      />
                      <label htmlFor={`tax-${transaction.id}`} className="text-sm">
                        Tax deductible expense
                      </label>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-medium">{transaction.description}</p>
                    {transaction.merchant_name && (
                      <p className="text-xs text-muted-foreground">{transaction.merchant_name}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {new Date(transaction.date).toLocaleDateString()}
                    </p>
                    {transaction.category && (
                      <Badge variant="outline" className="text-xs mt-1">
                        Suggested: {transaction.category}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              {editingTransaction === transaction.id ? (
                <div className="flex space-x-2">
                  <Button size="sm" onClick={() => handleSaveEdit(transaction.id)}>
                    <Check className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setEditingTransaction(null)}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="flex space-x-2">
                  <Button size="sm" onClick={() => handleConfirm(transaction)}>
                    <Check className="h-4 w-4 mr-1" />
                    Confirm & Track
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleStartEdit(transaction)}>
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => onExcludeTransaction(transaction.id)}>
                    <X className="h-4 w-4 mr-1" />
                    Exclude
                  </Button>
                </div>
              )}
              
              {!editingTransaction && transaction.is_potential_medical && (
                <div className="text-xs text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  May qualify for tax deduction
                </div>
              )}
            </div>
          </div>
        ))}
        
        <div className="pt-3 border-t">
          <p className="text-xs text-muted-foreground">
            💡 <strong>Tip:</strong> Confirmed transactions will appear in your expense list with an "Auto-imported" badge. 
            You can always edit or remove them later.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AutoImportedTransactions;
