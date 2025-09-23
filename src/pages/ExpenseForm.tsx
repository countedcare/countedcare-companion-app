import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import Layout from '@/components/Layout';
import { Expense, EXPENSE_CATEGORIES } from '@/types/User';

import useGoogleMapsAPI from '@/hooks/useGoogleMapsAPI';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseCareRecipients } from '@/hooks/useSupabaseCareRecipients';
import { useLinkedAccounts } from '@/hooks/useLinkedAccounts';

// Import the new components
import ExpenseBasicFields from '@/components/expenses/ExpenseBasicFields';
import ExpenseLocationSection from '@/components/expenses/ExpenseLocationSection';
import ExpenseReceiptUpload from '@/components/expenses/ExpenseReceiptUpload';
import ExpenseCategorySection from '@/components/expenses/ExpenseCategorySection';
import ExpenseFormActions from '@/components/expenses/ExpenseFormActions';
import GoogleMapsAPIConfig from '@/components/places/GoogleMapsAPIConfig';

const ExpenseForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const { user: authUser } = useAuth();
  const { recipients } = useSupabaseCareRecipients();
  const { accounts: linkedAccounts } = useLinkedAccounts();
  
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  
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
  
  
  // Google Maps integration
  const { apiKey, isConfigured } = useGoogleMapsAPI();
  const [selectedLocation, setSelectedLocation] = useState<google.maps.places.PlaceResult | null>(null);
  
  // Load expenses from Supabase
  const loadExpenses = async () => {
    if (!authUser) {
      setLoading(false);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select(`
          *,
          synced_transactions!expenses_synced_transaction_id_fkey(
            description,
            merchant_name
          )
        `)
        .eq('user_id', authUser.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform database format to local format
      const transformedExpenses: Expense[] = (data || []).map(expense => {
        // Use synced transaction description if available, otherwise fall back to expense description
        let description = expense.description || expense.notes || '';
        
        if (expense.synced_transaction_id && expense.synced_transactions) {
          const syncedTransaction = Array.isArray(expense.synced_transactions) 
            ? expense.synced_transactions[0] 
            : expense.synced_transactions;
          
          if (syncedTransaction) {
            description = syncedTransaction.merchant_name || syncedTransaction.description || description;
          }
        }
        
        return {
          ...expense,
          careRecipientId: expense.care_recipient_id || '',
          receiptUrl: expense.receipt_url,
          description,
          triage_status: (expense.triage_status as 'pending' | 'kept' | 'skipped') || 'pending',
        };
      });
      
      setExpenses(transformedExpenses);
    } catch (error) {
      console.error('Error loading expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, [authUser]);
  
  // Handle pre-selected category from URL params and Plaid prefill
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    const isPrefill = searchParams.get('prefill') === 'true';
    
    // Prefill from Plaid transaction data
    if (isPrefill) {
      const prefillData = {
        external_id: searchParams.get('external_id'),
        account_id: searchParams.get('account_id'),
        date: searchParams.get('date'),
        amount: searchParams.get('amount'),
        currency: searchParams.get('currency'),
        merchant: searchParams.get('merchant'),
        memo: searchParams.get('memo'),
        category_guess: searchParams.get('category_guess'),
        payment_channel: searchParams.get('payment_channel'),
        status: searchParams.get('status'),
        is_refund: searchParams.get('is_refund') === 'true',
        is_medical_related: searchParams.get('is_medical_related') === 'true'
      };
      
      // Set form fields from Plaid data
      if (prefillData.amount) setAmount(prefillData.amount);
      if (prefillData.merchant) {
        setTitle(prefillData.merchant);
        setVendor(prefillData.merchant);
      }
      if (prefillData.memo) setDescription(prefillData.memo);
      if (prefillData.category_guess) setCategory(prefillData.category_guess);
      if (prefillData.date) setDate(new Date(prefillData.date));
      
      toast({
        title: "Transaction imported!",
        description: "Form prefilled from your bank transaction. Please review and complete.",
      });
    }
  }, [searchParams, toast]);
  
  // For editing mode
  useEffect(() => {
    if (id) {
      const expenseToEdit = expenses.find(expense => expense.id === id);
      if (expenseToEdit) {
        setTitle(expenseToEdit.description || '');
        setVendor(expenseToEdit.vendor || '');
        setAmount(expenseToEdit.amount.toString());
        setCategory(expenseToEdit.category);
        setSubcategory(expenseToEdit.subcategory || '');
        setDescription(expenseToEdit.description || '');
        setCareRecipientId(expenseToEdit.careRecipientId);
        setReceiptUrl(expenseToEdit.receiptUrl);
        setSourceAccountId(expenseToEdit.linked_account_id || '');
      }
    }
  }, [id, expenses]);

  const handleReceiptProcessed = (extractedData: any) => {
    console.log('Receipt data extracted:', extractedData);
    
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
    
    // Try to match category with new comprehensive categories
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
    
    if (!authUser) {
      toast({
        title: "Error",
        description: "You must be logged in to save expenses",
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
    
    try {
      const expenseData = {
        amount: parseFloat(amount),
        date: date.toISOString().split('T')[0], // Convert to date string
        category,
        description: title || description,
        vendor: vendor || null,
        user_id: authUser.id,
        care_recipient_id: careRecipientId === 'myself' ? null : careRecipientId || null,
        receipt_url: receiptUrl || null,
        notes: description || null,
        linked_account_id: sourceAccountId || null,
      };

      if (id) {
        // Update existing expense
        const { error } = await supabase
          .from('expenses')
          .update(expenseData)
          .eq('id', id)
          .eq('user_id', authUser.id);

        if (error) throw error;
        
        toast({
          title: "Expense Updated",
          description: "Your expense has been updated successfully."
        });
      } else {
        // Create new expense
        const { error } = await supabase
          .from('expenses')
          .insert([expenseData]);

        if (error) throw error;
        
        toast({
          title: "Expense Added!",
          description: "Your expense has been saved successfully."
        });
      }

      navigate('/expenses');
    } catch (error) {
      console.error('Error saving expense:', error);
      toast({
        title: "Error",
        description: "Failed to save expense. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleDelete = async () => {
    if (!id || !authUser) return;

    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id)
        .eq('user_id', authUser.id);

      if (error) throw error;
      
      toast({
        title: "Expense Deleted",
        description: "Your expense has been deleted successfully."
      });
      
      navigate('/expenses');
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast({
        title: "Error",
        description: "Failed to delete expense. Please try again.",
        variant: "destructive"
      });
    }
  };


  if (loading) {
    return (
      <Layout>
        <div className="container-padding py-6 flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-padding py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-heading">
            {id ? 'Edit' : 'Add New'} Expense
          </h1>
        </div>
        
        <form onSubmit={handleSubmit}>
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
              
              {/* Form Actions */}
              <ExpenseFormActions
                isEditing={!!id}
                onDelete={handleDelete}
              />
            </CardContent>
          </Card>
        </form>
      </div>
    </Layout>
  );
};

export default ExpenseForm;
