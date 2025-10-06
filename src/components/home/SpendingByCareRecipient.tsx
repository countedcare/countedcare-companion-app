import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users, TrendingUp, AlertCircle } from 'lucide-react';
import { useExpenseData } from '@/hooks/useExpenseData';
import { useSupabaseCareRecipients } from '@/hooks/useSupabaseCareRecipients';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function SpendingByCareRecipient() {
  const navigate = useNavigate();
  const { expenses, stats } = useExpenseData();
  const { recipients } = useSupabaseCareRecipients();

  // Calculate spending by recipient
  const spendingByRecipient = React.useMemo(() => {
    const spending = new Map<string, { name: string; amount: number; count: number }>();
    let unassignedAmount = 0;
    let unassignedCount = 0;

    expenses.forEach(expense => {
      if (expense.care_recipient_id) {
        const recipient = recipients.find(r => r.id === expense.care_recipient_id);
        if (recipient) {
          const current = spending.get(expense.care_recipient_id) || { name: recipient.name, amount: 0, count: 0 };
          spending.set(expense.care_recipient_id, {
            name: recipient.name,
            amount: current.amount + Number(expense.amount),
            count: current.count + 1
          });
        }
      } else {
        unassignedAmount += Number(expense.amount);
        unassignedCount += 1;
      }
    });

    return {
      recipients: Array.from(spending.entries()).map(([id, data]) => ({ id, ...data })),
      unassigned: { amount: unassignedAmount, count: unassignedCount }
    };
  }, [expenses, recipients]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const totalAssigned = spendingByRecipient.recipients.reduce((sum, r) => sum + r.amount, 0);
  const percentageUnassigned = stats.total > 0 
    ? Math.round((spendingByRecipient.unassigned.count / stats.total) * 100)
    : 0;

  if (recipients.length === 0) {
    return null; // Don't show if no recipients
  }

  return (
    <div className="px-4">
      <Card className="border-0 shadow-lg overflow-hidden">
        <CardHeader className="pb-4 bg-gradient-to-r from-purple-50 to-blue-50">
          <CardTitle className="flex items-center text-gray-900">
            <Users className="h-5 w-5 mr-2 text-gray-600" />
            Spending by Care Recipient
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-6 space-y-4">
          {/* Recipient breakdown */}
          {spendingByRecipient.recipients.length > 0 ? (
            <div className="space-y-3">
              {spendingByRecipient.recipients.map(recipient => (
                <div
                  key={recipient.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-primary/5 to-primary/10 hover:from-primary/10 hover:to-primary/15 transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                        {getInitials(recipient.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-gray-900">{recipient.name}</div>
                      <div className="text-sm text-gray-600">
                        {recipient.count} {recipient.count === 1 ? 'expense' : 'expenses'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg text-primary">
                      {formatCurrency(recipient.amount)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {totalAssigned > 0 ? Math.round((recipient.amount / totalAssigned) * 100) : 0}% of assigned
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                <Users className="h-8 w-8 text-primary/60" />
              </div>
              <p className="text-gray-600 text-sm">No expenses assigned to care recipients yet</p>
            </div>
          )}

          {/* Unassigned expenses warning */}
          {spendingByRecipient.unassigned.count > 0 && (
            <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-medium text-amber-900 mb-1">
                    {spendingByRecipient.unassigned.count} Unassigned Expenses
                  </div>
                  <div className="text-sm text-amber-700 mb-2">
                    {formatCurrency(spendingByRecipient.unassigned.amount)} ({percentageUnassigned}% of total) not linked to any care recipient
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate('/expenses')}
                    className="bg-white hover:bg-amber-50 border-amber-300 text-amber-700"
                  >
                    Review & Assign
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Summary stats */}
          {spendingByRecipient.recipients.length > 0 && (
            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  Total assigned spending
                </span>
                <span className="font-bold text-primary">
                  {formatCurrency(totalAssigned)}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
