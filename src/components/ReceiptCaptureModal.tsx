import React, { useState, useRef } from 'react';
import { Camera, Upload, X, DollarSign, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { EXPENSE_CATEGORIES } from '@/types/User';

interface ReceiptCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExpenseAdded: () => void;
}

interface TaxDeductibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResponse: (response: boolean | null) => void;
}

const TaxDeductibilityModal: React.FC<TaxDeductibilityModalProps> = ({ isOpen, onClose, onResponse }) => {
  const handleResponse = (response: boolean | null) => {
    onResponse(response);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Tax Deduction Question</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-center text-muted-foreground">
            Do you think this expense might qualify for a tax deduction?
          </p>
          <div className="flex flex-col space-y-2">
            <Button onClick={() => handleResponse(true)} className="w-full">
              Yes, it might be deductible
            </Button>
            <Button onClick={() => handleResponse(false)} variant="outline" className="w-full">
              No, probably not deductible
            </Button>
            <Button onClick={() => handleResponse(null)} variant="ghost" className="w-full">
              Not sure
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const ReceiptCaptureModal: React.FC<ReceiptCaptureModalProps> = ({ isOpen, onClose, onExpenseAdded }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<'capture' | 'details' | 'tax-question'>('capture');
  const [receiptUrl, setReceiptUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form data
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [showTaxModal, setShowTaxModal] = useState(false);

  const uploadReceiptToStorage = async (file: File): Promise<string> => {
    if (!user) throw new Error('User not authenticated');

    const ext = file.name.split('.').pop() || 'jpg';
    const path = `${user.id}/${Date.now()}.${ext}`;

    const { data, error } = await supabase.storage.from('receipts').upload(path, file);
    if (error) throw error;

    const { data: signed, error: signError } = await supabase.storage
      .from('receipts')
      .createSignedUrl(data.path, 60 * 60);
    if (signError) throw signError;

    return signed.signedUrl; // use the signed URL directly for preview
  };

  const handleFileSelect = async (file: File) => {
    if (!file) return;
    setIsUploading(true);
    try {
      const url = await uploadReceiptToStorage(file);
      setReceiptUrl(url);
      setStep('details');
      toast({ title: 'Receipt uploaded!', description: 'Now enter the expense details.' });
    } catch (e) {
      console.error(e);
      toast({ title: 'Upload failed', description: 'Please try again.', variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  };

  const handlePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
    e.target.value = ''; // allow re-picking the same file
  };

  const handleSubmitExpense = async () => {
    if (!user || !amount || !category) {
      toast({ title: 'Missing information', description: 'Please fill in amount and category.', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('expenses').insert({
        user_id: user.id,
        amount: parseFloat(amount),
        category,
        date,
        description: notes || undefined,
        receipt_url: receiptUrl || undefined
      });
      if (error) throw error;

      toast({ title: 'Expense added!', description: 'Your expense has been saved successfully.' });
      setStep('tax-question');
      setShowTaxModal(true);
    } catch (e) {
      console.error(e);
      toast({ title: 'Failed to save expense', description: 'Please try again.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTaxDeductibilityResponse = async (response: boolean | null) => {
    if (user) {
      try {
        const { data: expenses, error: fetchError } = await supabase
          .from('expenses')
          .select('id')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1);
        if (fetchError) throw fetchError;

        if (expenses?.length) {
          const { error: updateError } = await supabase
            .from('expenses')
            .update({ is_potentially_deductible: response })
            .eq('id', expenses[0].id);
          if (updateError) throw updateError;
        }
      } catch (e) {
        console.error('Error updating tax deductibility:', e);
      }
    }

    onExpenseAdded();
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setStep('capture');
    setReceiptUrl('');
    setAmount('');
    setCategory('');
    setDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setShowTaxModal(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        {/* wider / taller modal, and scrollable */}
        <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              Add Expense
              <Button variant="ghost" size="icon" onClick={handleClose}>
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {step === 'capture' && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">
                  Take a photo or upload a receipt to get started
                </p>

                <div className="grid grid-cols-2 gap-3">
                  {/* Use camera input for mobile (capture attr), falls back to picker on desktop */}
                  <Button
                    variant="outline"
                    className="h-24 flex-col space-y-2"
                    onClick={() => cameraInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    <Camera className="h-6 w-6" />
                    <span>Take Photo</span>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-24 flex-col space-y-2"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    <Upload className="h-6 w-6" />
                    <span>Upload File</span>
                  </Button>
                </div>

                {/* camera (rear) where supported */}
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePickerChange}
                  className="hidden"
                />
                {/* general picker (image/PDF) */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handlePickerChange}
                  className="hidden"
                />

                <div className="text-center">
                  <Button variant="link" onClick={() => setStep('details')} className="text-sm">
                    Skip and enter manually
                  </Button>
                </div>

                {isUploading && (
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto" />
                    <p className="text-sm text-muted-foreground mt-2">Uploading receipt...</p>
                  </div>
                )}
              </div>
            )}

            {step === 'details' && (
              <div className="space-y-4">
                {receiptUrl && (
                  <Card>
                    <CardContent className="pt-4">
                      {/* Larger, visible preview; use object-contain to avoid cropping */}
                      {/(\.pdf($|\?))/i.test(receiptUrl) ? (
                        <embed
                          src={receiptUrl}
                          type="application/pdf"
                          className="w-full h-80 rounded"
                        />
                      ) : (
                        <img
                          src={receiptUrl}
                          alt="Receipt"
                          className="w-full h-80 object-contain bg-muted rounded"
                        />
                      )}
                    </CardContent>
                  </Card>
                )}

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPENSE_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Additional details..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="flex space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setStep('capture')} className="flex-1">
                    Back
                  </Button>
                  <Button onClick={handleSubmitExpense} disabled={isSubmitting || !amount || !category} className="flex-1">
                    {isSubmitting ? 'Saving…' : 'Save Expense'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <TaxDeductibilityModal
        isOpen={showTaxModal}
        onClose={() => setShowTaxModal(false)}
        onResponse={handleTaxDeductibilityResponse}
      />
    </>
  );
};

export default ReceiptCaptureModal;
