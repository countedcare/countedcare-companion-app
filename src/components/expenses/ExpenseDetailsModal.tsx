import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Expense, EXPENSE_CATEGORIES } from '@/types/User';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseCareRecipients } from '@/hooks/useSupabaseCareRecipients';
import { useLinkedAccounts } from '@/hooks/useLinkedAccounts';

// Import the expense form components
import ExpenseBasicFields from '@/components/expenses/ExpenseBasicFields';
import ExpenseLocationSection from '@/components/expenses/ExpenseLocationSection';
import ExpenseReceiptUpload from '@/components/expenses/ExpenseReceiptUpload';
import ExpenseCategorySection from '@/components/expenses/ExpenseCategorySection';
import ExpenseFormActions from '@/components/expenses/ExpenseFormActions';
import useGoogleMapsAPI from '@/hooks/useGoogleMapsAPI';

interface ExpenseDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: Expense | null;
  onExpenseUpdated?: () => void;
}

export function ExpenseDetailsModal({ 
  isOpen, 
  onClose, 
  expense, 
  onExpenseUpdated 
}: ExpenseDetailsModalProps) {
  const { toast } = useToast();
  const { user: authUser } = useAuth();
  const { recipients } = useSupabaseCareRecipients();
  const { accounts: linkedAccounts } = useLinkedAccounts();
  const { apiKey, isConfigured } = useGoogleMapsAPI();
  
  // Form state
  const [title, setTitle] = useState('');
  const [vendor, setVendor] = useState('');
  const [amount, setAmount] = useState('');
  const [sourceAccountId, setSourceAccountId] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [description, setDescription] = useState('');
  const [careRecipientId, setCareRecipientId] = useState('');
  const [receiptUrl, setReceiptUrl] = useState<string | undefined>(undefined);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessingDocument, setIsProcessingDocument] = useState(false);
  const [isTaxDeductible, setIsTaxDeductible] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<google.maps.places.PlaceResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Populate form when expense changes
  useEffect(() => {
    if (expense && isOpen) {
      setTitle(expense.description || '');
      setVendor(expense.vendor || '');
      setAmount(expense.amount.toString());
      setDate(new Date(expense.date));
      setCategory(expense.category);
      setSubcategory(expense.subcategory || '');
      setDescription(expense.description || expense.notes || '');
      setCareRecipientId(expense.careRecipientId || expense.care_recipient_id || '');
      setReceiptUrl(expense.receiptUrl || expense.receipt_url);
      setSourceAccountId(expense.linked_account_id || '');
      setIsTaxDeductible(expense.is_tax_deductible || false);
    }
  }, [expense, isOpen]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTitle('');
      setVendor('');
      setAmount('');
      setSourceAccountId('');
      setDate(new Date());
      setCategory('');
      setSubcategory('');
      setDescription('');
      setCareRecipientId('');
      setReceiptUrl(undefined);
      setIsUploading(false);
      setIsProcessingDocument(false);
      setIsTaxDeductible(false);
      setSelectedLocation(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleReceiptProcessed = (extractedData: any) => {
    // Auto-populate form fields with extracted data
    if (extractedData.amount && extractedData.amount > 0) {
      setAmount(extractedData.amount.toString());
    }
    
    if (extractedData.date) {
      try {
        const parsedDate = new Date(extractedData.date);
        if (!isNaN(parsedDate.getTime())) {
          setDate(parsedDate);
        }
      } catch (error) {
        console.error('Error parsing date:', error);
      }
    }
    
    if (extractedData.merchant) {
      setTitle(extractedData.merchant);
    }
    if (extractedData.vendor) {
      setVendor(extractedData.vendor);
    }
    
    // Try to match category
    if (extractedData.category) {
      const matchedCategory = EXPENSE_CATEGORIES.find(cat => 
        cat.toLowerCase().includes(extractedData.category.toLowerCase()) ||
        extractedData.category.toLowerCase().includes('medical') && cat.includes('Medical') ||
        extractedData.category.toLowerCase().includes('dental') && cat.includes('Dental') ||
        extractedData.category.toLowerCase().includes('pharmacy') && cat.includes('Prescriptions')
      );
      if (matchedCategory) {
        setCategory(matchedCategory);
      }
    }
    
    if (extractedData.description) {
      setDescription(extractedData.description);
    }
    
    toast({
      title: "Form Auto-Populated!",
      description: "Please review and adjust the extracted information as needed.",
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!authUser || !expense) {
      toast({
        title: "Error",
        description: "You must be logged in and have an expense selected",
        variant: "destructive"
      });
      return;
    }
    
    // Validate required fields
    if (!amount || !category) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const expenseData = {
        amount: parseFloat(amount),
        date: date.toISOString().split('T')[0],
        category,
        description: title || description,
        vendor: vendor || null,
        care_recipient_id: careRecipientId === 'myself' ? null : careRecipientId || null,
        receipt_url: receiptUrl || null,
        notes: description || null,
        linked_account_id: sourceAccountId || null,
        is_tax_deductible: isTaxDeductible,
        is_potentially_deductible: isTaxDeductible,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('expenses')
        .update(expenseData)
        .eq('id', expense.id)
        .eq('user_id', authUser.id);

      if (error) throw error;
      
      toast({
        title: "Expense Updated",
        description: "Your expense has been updated successfully."
      });

      onExpenseUpdated?.();
      onClose();
    } catch (error) {
      console.error('Error saving expense:', error);
      toast({
        title: "Error",
        description: "Failed to save expense. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDelete = async () => {
    if (!expense || !authUser) return;

    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', expense.id)
        .eq('user_id', authUser.id);

      if (error) throw error;
      
      toast({
        title: "Expense Deleted",
        description: "Your expense has been deleted successfully."
      });
      
      onExpenseUpdated?.();
      onClose();
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast({
        title: "Error",
        description: "Failed to delete expense. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (!expense) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Expense</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Basic Information */}
                <ExpenseBasicFields
                  title={title}
                  setTitle={setTitle}
                  amount={amount}
                  setAmount={setAmount}
                  sourceAccountId={sourceAccountId}
                  setSourceAccountId={setSourceAccountId}
                  linkedAccounts={linkedAccounts}
                  date={date}
                  setDate={setDate}
                />

                {/* Receipt Upload */}
                <ExpenseReceiptUpload
                  receiptUrl={receiptUrl}
                  setReceiptUrl={setReceiptUrl}
                  isUploading={isUploading}
                  setIsUploading={setIsUploading}
                  isProcessingDocument={isProcessingDocument}
                  setIsProcessingDocument={setIsProcessingDocument}
                  onReceiptProcessed={handleReceiptProcessed}
                />
                
                {/* Vendor */}
                <div className="space-y-2">
                  <Label htmlFor="vendor">Vendor</Label>
                  <Input
                    id="vendor"
                    placeholder="e.g., Walgreens, UCLA Health"
                    value={vendor}
                    onChange={(e) => setVendor(e.target.value)}
                  />
                </div>

                {/* Google Maps API Setup */}
                {!isConfigured && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-sm text-yellow-800">
                      Google Maps API is not configured. Location features will be limited.
                    </p>
                  </div>
                )}

                {/* Location Search */}
                <ExpenseLocationSection
                  selectedLocation={selectedLocation}
                  setSelectedLocation={setSelectedLocation}
                  title={title}
                  setTitle={setTitle}
                  apiKey={apiKey}
                />
                
                {/* Category Selection */}
                <ExpenseCategorySection
                  category={category}
                  setCategory={setCategory}
                  subcategory={subcategory}
                  setSubcategory={setSubcategory}
                  careRecipientId={careRecipientId}
                  setCareRecipientId={setCareRecipientId}
                  recipients={recipients}
                  isTaxDeductible={isTaxDeductible}
                  setIsTaxDeductible={setIsTaxDeductible}
                />

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Enter any additional information about this expense"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-between pt-4">
            <ExpenseFormActions
              isEditing={true}
              onDelete={handleDelete}
            />
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}