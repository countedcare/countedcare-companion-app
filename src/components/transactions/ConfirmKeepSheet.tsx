import React, { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Camera, Upload, Mail } from 'lucide-react';
import { PrefillExpense } from '@/hooks/useTransactionTriage';
import { useSupabaseCareRecipients } from '@/hooks/useSupabaseCareRecipients';

interface ConfirmKeepSheetProps {
  expense: PrefillExpense | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmWithReceipt: (expense: PrefillExpense) => void;
  onSaveWithoutReceipt: (expense: PrefillExpense) => void;
}

export const ConfirmKeepSheet = ({
  expense,
  isOpen,
  onClose,
  onConfirmWithReceipt,
  onSaveWithoutReceipt
}: ConfirmKeepSheetProps) => {
  const { recipients: careRecipients } = useSupabaseCareRecipients();
  const [isMedicalRelated, setIsMedicalRelated] = useState(expense?.is_medical_related || false);
  const [selectedCareRecipient, setSelectedCareRecipient] = useState<string>('');
  const [notes, setNotes] = useState(expense?.notes || '');
  const [categoryGuess, setCategoryGuess] = useState(expense?.category_guess || '');

  if (!expense) return null;

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: expense.currency || 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleConfirmWithReceipt = () => {
    const updatedExpense = {
      ...expense,
      is_medical_related: isMedicalRelated,
      care_recipient_id: selectedCareRecipient || undefined,
      notes,
      category_guess: categoryGuess
    };
    onConfirmWithReceipt(updatedExpense);
  };

  const handleSaveWithoutReceipt = () => {
    const updatedExpense = {
      ...expense,
      is_medical_related: isMedicalRelated,
      care_recipient_id: selectedCareRecipient || undefined,
      notes,
      category_guess: categoryGuess
    };
    onSaveWithoutReceipt(updatedExpense);
  };

  const getCategoryOptions = () => {
    const categories = [
      'Medical > Healthcare Services',
      'Medical > Pharmacy',
      'Medical > Equipment',
      'Transportation',
      'Other'
    ];
    return categories;
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="max-h-[90vh]">
        <SheetHeader className="space-y-4">
          <SheetTitle className="text-left">Confirm Details</SheetTitle>
          <SheetDescription className="text-left">
            Review and adjust the expense details before saving.
          </SheetDescription>
        </SheetHeader>

        <div className="py-6 space-y-6">
          {/* Transaction Summary (Read-only) */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between items-center">
              <div className="font-medium">{expense.merchant}</div>
              <div className="font-bold">{formatAmount(expense.amount)}</div>
            </div>
            <div className="text-sm text-muted-foreground">
              {formatDate(expense.date)} • {expense.payment_channel}
              {expense.status === 'pending' && (
                <Badge variant="secondary" className="ml-2">Pending</Badge>
              )}
            </div>
          </div>

          <Separator />

          {/* Editable Fields */}
          <div className="space-y-6">
            {/* Category Selection */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Category</Label>
              <div className="flex flex-wrap gap-2">
                {getCategoryOptions().map((category) => (
                  <Badge
                    key={category}
                    variant={categoryGuess === category ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setCategoryGuess(category)}
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Medical Care Toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base font-medium">
                  Related to medical care (or travel to care)?
                </Label>
                <p className="text-sm text-muted-foreground">
                  This helps with tax deduction tracking
                </p>
              </div>
              <Switch
                checked={isMedicalRelated}
                onCheckedChange={setIsMedicalRelated}
              />
            </div>

            {/* Care Recipient Selector */}
            {isMedicalRelated && (
              <div className="space-y-3">
                <Label className="text-base font-medium">Care Recipient</Label>
                <div className="flex flex-wrap gap-2">
                  {careRecipients.map((recipient) => (
                    <Badge
                      key={recipient.id}
                      variant={selectedCareRecipient === recipient.id ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setSelectedCareRecipient(
                        selectedCareRecipient === recipient.id ? '' : recipient.id
                      )}
                    >
                      {recipient.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="space-y-3">
              <Label htmlFor="notes" className="text-base font-medium">
                Notes (optional)
              </Label>
              <Textarea
                id="notes"
                placeholder="Add any additional notes about this expense..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-3 pt-4 border-t">
          <Button
            className="w-full"
            onClick={handleConfirmWithReceipt}
          >
            <Camera className="w-4 h-4 mr-2" />
            Confirm & Add Receipt
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={handleSaveWithoutReceipt}
          >
            Save without receipt
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-3">
          Receipts help prove medical purpose. Snap it now or I'll remind you later.
        </p>
      </SheetContent>
    </Sheet>
  );
};