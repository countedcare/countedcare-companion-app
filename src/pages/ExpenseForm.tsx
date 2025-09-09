import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import Layout from '@/components/Layout';
import { Expense, EXPENSE_CATEGORIES } from '@/types/User';
import EnhancedExpenseFields from '@/components/expenses/EnhancedExpenseFields';
import useGoogleMapsAPI from '@/hooks/useGoogleMapsAPI';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseCareRecipients } from '@/hooks/useSupabaseCareRecipients';

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
  
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [title, setTitle] = useState('');
  const [vendor, setVendor] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [description, setDescription] = useState('');
  const [careRecipientId, setCareRecipientId] = useState('');
  const [receiptUrl, setReceiptUrl] = useState<string | undefined>(undefined);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessingDocument, setIsProcessingDocument] = useState(false);
  
  // Enhanced tracking fields
  const [expenseTags, setExpenseTags] = useState<string[]>([]);
  const [isTaxDeductible, setIsTaxDeductible] = useState(true);
  const [reimbursementSource, setReimbursementSource] = useState('');
  const [linkedAccountId, setLinkedAccountId] = useState('');
  
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
        .select('*')
        .eq('user_id', authUser.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform database format to local format
      const transformedExpenses: Expense[] = (data || []).map(expense => ({
        ...expense,
        careRecipientId: expense.care_recipient_id || '',
        receiptUrl: expense.receipt_url,
        description: expense.description || expense.notes || '',
      }));
      
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
  
  // Handle pre-selected category from URL params
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    const subcategoryParam = searchParams.get('subcategory');
    
    if (categoryParam === 'transportation' && subcategoryParam === 'mileage') {
      setCategory('🚘 Transportation & Travel for Medical Care');
      setSubcategory('Mileage for car travel (21 cents/mile in 2024)');
    }
  }, [searchParams]);
  
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
        setExpenseTags(expenseToEdit.expense_tags || []);
        setIsTaxDeductible(expenseToEdit.is_tax_deductible || false);
        setReimbursementSource(expenseToEdit.reimbursement_source || '');
        setLinkedAccountId(expenseToEdit.synced_transaction_id || '');
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
    
    // Set as potentially tax deductible for medical expenses
    if (extractedData.category && (
      extractedData.category.toLowerCase().includes('medical') ||
      extractedData.category.toLowerCase().includes('pharmacy') ||
      extractedData.category.toLowerCase().includes('dental')
    )) {
      setIsTaxDeductible(true);
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
        care_recipient_id: careRecipientId || null,
        receipt_url: receiptUrl || null,
        is_tax_deductible: isTaxDeductible,
        reimbursement_source: reimbursementSource && reimbursementSource !== 'none' ? reimbursementSource : null,
        notes: description || null
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

  const handleMileageAmountCalculated = (calculatedAmount: number) => {
    setAmount(calculatedAmount.toString());
  };

  const isMileageMode =
    category === '🚘 Transportation & Travel for Medical Care' &&
    (subcategory?.toLowerCase().includes('mileage') || subcategory?.toLowerCase().includes('mile'));


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
                  date={date}
                  setDate={setDate}
                  amountReadOnly={isMileageMode}
                  amountNote={isMileageMode ? "Calculated from mileage at $0.21/mi" : undefined}
                />
                
                {/* Vendor */}
                {!isMileageMode && (
                  <div className="space-y-2">
                    <Label htmlFor="vendor">Vendor</Label>
                    <Input
                      id="vendor"
                      placeholder="e.g., Walgreens, UCLA Health"
                      value={vendor}
                      onChange={(e) => setVendor(e.target.value)}
                    />
                  </div>
                )}

                {/* Google Maps API Setup */}
                {!isMileageMode && !isConfigured && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-sm text-yellow-800">
                      Google Maps API is not configured. Location features will be limited.
                    </p>
                  </div>
                )}

                {/* Location Search */}
                {!isMileageMode && (
                  <ExpenseLocationSection
                    selectedLocation={selectedLocation}
                    setSelectedLocation={setSelectedLocation}
                    title={title}
                    setTitle={setTitle}
                    apiKey={apiKey}
                  />
                )}
                
                {/* Category Selection */}
                <ExpenseCategorySection
                  category={category}
                  setCategory={setCategory}
                  subcategory={subcategory}
                  setSubcategory={setSubcategory}
                  careRecipientId={careRecipientId}
                  setCareRecipientId={setCareRecipientId}
                  recipients={recipients}
                  onMileageAmountCalculated={handleMileageAmountCalculated}
                />

                {/* Receipt Upload */}
                {!isMileageMode && (
                  <ExpenseReceiptUpload
                    receiptUrl={receiptUrl}
                    setReceiptUrl={setReceiptUrl}
                    isUploading={isUploading}
                    setIsUploading={setIsUploading}
                    isProcessingDocument={isProcessingDocument}
                    setIsProcessingDocument={setIsProcessingDocument}
                    onReceiptProcessed={handleReceiptProcessed}
                  />
                )}
                
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
                
                {/* Enhanced Expense Fields */}
                <EnhancedExpenseFields
                  expenseTags={expenseTags}
                  setExpenseTags={setExpenseTags}
                  isTaxDeductible={isTaxDeductible}
                  setIsTaxDeductible={setIsTaxDeductible}
                  reimbursementSource={reimbursementSource}
                  setReimbursementSource={setReimbursementSource}
                  linkedAccountId={linkedAccountId}
                  setLinkedAccountId={setLinkedAccountId}
                />
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
