
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { EXPENSE_TAGS, REIMBURSEMENT_SOURCES } from '@/types/FinancialAccount';
import { LinkedAccount } from '@/types/FinancialAccount';
import { useLinkedAccounts } from '@/hooks/useLinkedAccounts';

interface EnhancedExpenseFieldsProps {
  expenseTags: string[];
  setExpenseTags: (tags: string[]) => void;
  isTaxDeductible: boolean;
  setIsTaxDeductible: (value: boolean) => void;
  reimbursementSource: string;
  setReimbursementSource: (value: string) => void;
  linkedAccountId: string;
  setLinkedAccountId: (value: string) => void;
}

const EnhancedExpenseFields = ({
  expenseTags,
  setExpenseTags,
  isTaxDeductible,
  setIsTaxDeductible,
  reimbursementSource,
  setReimbursementSource,
  linkedAccountId,
  setLinkedAccountId
}: EnhancedExpenseFieldsProps) => {
  const { accounts: linkedAccounts } = useLinkedAccounts();

  const addTag = (tag: string) => {
    if (!expenseTags.includes(tag)) {
      setExpenseTags([...expenseTags, tag]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setExpenseTags(expenseTags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="space-y-4 border-t pt-4">
      <h3 className="font-medium text-sm text-gray-700">Enhanced Tracking</h3>
      
      {/* Linked Account */}
      <div className="space-y-2">
        <Label htmlFor="linked-account">Account Used</Label>
        <Select value={linkedAccountId} onValueChange={setLinkedAccountId}>
          <SelectTrigger>
            <SelectValue placeholder="Select the account this expense came from" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Not specified</SelectItem>
            {linkedAccounts.map(account => (
              <SelectItem key={account.id} value={account.id}>
                {account.account_name} ({account.account_type.toUpperCase()})
                {account.institution_name && ` - ${account.institution_name}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Tax Deductible Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <Label htmlFor="tax-deductible" className="text-sm font-medium">
            Tax Deductible
          </Label>
          <p className="text-xs text-gray-500">
            Mark if this expense may qualify for tax deduction
          </p>
        </div>
        <Switch
          id="tax-deductible"
          checked={isTaxDeductible}
          onCheckedChange={setIsTaxDeductible}
        />
      </div>

      {/* Expense Tags */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Expense Tags</Label>
        <Select onValueChange={addTag}>
          <SelectTrigger>
            <SelectValue placeholder="Add tags to categorize this expense" />
          </SelectTrigger>
          <SelectContent>
            {EXPENSE_TAGS.filter(tag => !expenseTags.includes(tag)).map(tag => (
              <SelectItem key={tag} value={tag}>
                {tag.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {expenseTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {expenseTags.map(tag => (
              <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                {tag.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => removeTag(tag)}
                />
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Reimbursement Source */}
      <div className="space-y-2">
        <Label htmlFor="reimbursement">Reimbursement Source</Label>
        <Select value={reimbursementSource} onValueChange={setReimbursementSource}>
          <SelectTrigger>
            <SelectValue placeholder="Select if this was reimbursed" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Not Reimbursed</SelectItem>
            {REIMBURSEMENT_SOURCES.map(source => (
              <SelectItem key={source.value} value={source.value}>
                {source.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default EnhancedExpenseFields;
