
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { LinkedAccount } from '@/types/FinancialAccount';

interface ExpenseBasicFieldsProps {
  title: string;
  setTitle: (value: string) => void;
  amount: string;
  setAmount: (value: string) => void;
  sourceAccountId: string;
  setSourceAccountId: (value: string) => void;
  linkedAccounts: LinkedAccount[];
  date: Date;
  setDate: (date: Date) => void;
  amountReadOnly?: boolean;
  amountNote?: string;
}

const ExpenseBasicFields: React.FC<ExpenseBasicFieldsProps> = ({
  title,
  setTitle,
  amount,
  setAmount,
  sourceAccountId,
  setSourceAccountId,
  linkedAccounts,
  date,
  setDate,
  amountReadOnly,
  amountNote
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Expense Title*</Label>
        <Input
          id="title"
          placeholder="Enter expense title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Amount ($)*</Label>
        <Input
          id="amount"
          type="number"
          placeholder="0.00"
          step="0.01"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          readOnly={!!amountReadOnly}
          aria-readonly={amountReadOnly ? 'true' : 'false'}
        />
        {amountNote && (
          <p className="text-xs text-muted-foreground">{amountNote}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="source-account">Bank Account</Label>
        <Select value={sourceAccountId} onValueChange={setSourceAccountId}>
          <SelectTrigger className="w-full bg-background">
            <SelectValue placeholder={linkedAccounts.length > 0 ? "Select account" : "No accounts linked"} />
          </SelectTrigger>
          <SelectContent className="bg-background border shadow-lg z-50">
            {linkedAccounts.length > 0 ? (
              linkedAccounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  <div className="flex flex-col">
                    <span className="font-medium">{account.account_name}</span>
                    <span className="text-sm text-muted-foreground">
                      {account.account_type.toUpperCase()}{account.institution_name ? ` • ${account.institution_name}` : ''}
                    </span>
                  </div>
                </SelectItem>
              ))
            ) : (
              <SelectItem value="" disabled>
                <span className="text-muted-foreground">No linked accounts found</span>
              </SelectItem>
            )}
          </SelectContent>
        </Select>
        {linkedAccounts.length === 0 && (
          <p className="text-xs text-muted-foreground">
            Add linked accounts in your{' '}
            <a href="/profile" className="text-primary hover:underline">
              Profile page
            </a>{' '}
            to track expenses by account.
          </p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label>Date*</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(date) => date && setDate(date)}
              initialFocus
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default ExpenseBasicFields;
