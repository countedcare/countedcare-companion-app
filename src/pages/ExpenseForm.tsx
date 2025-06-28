import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import Layout from '@/components/Layout';
import useLocalStorage from '@/hooks/useLocalStorage';
import { Expense, CareRecipient, EXPENSE_CATEGORIES } from '@/types/User';
import EnhancedExpenseFields from '@/components/expenses/EnhancedExpenseFields';
import useGoogleMapsAPI from '@/hooks/useGoogleMapsAPI';

// Import the new components
import ExpenseBasicFields from '@/components/expenses/ExpenseBasicFields';
import ExpenseLocationSection from '@/components/expenses/ExpenseLocationSection';
import ExpenseReceiptUpload from '@/components/expenses/ExpenseReceiptUpload';
import ExpenseCategorySection from '@/components/expenses/ExpenseCategorySection';
import ExpenseFormActions from '@/components/expenses/ExpenseFormActions';

const ExpenseForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  
  const [expenses, setExpenses] = useLocalStorage<Expense[]>('countedcare-expenses', []);
  const [recipients] = useLocalStorage<CareRecipient[]>('countedcare-recipients', []);
  
  const [title, setTitle] = useState('');
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
  const [isTaxDeductible, setIsTaxDeductible] = useState(false);
  const [reimbursementSource, setReimbursementSource] = useState('');
  const [linkedAccountId, setLinkedAccountId] = useState('');
  
  // Google Maps integration
  const { apiKey, isConfigured, saveApiKey } = useGoogleMapsAPI();
  const [selectedLocation, setSelectedLocation] = useState<google.maps.places.PlaceResult | null>(null);
  
  // Auto-configure API key if not set
  useEffect(() => {
    if (!isConfigured) {
      const defaultApiKey = 'AIzaSyBJB3wjcuzPWnBJS9J6vvTFQEc47agM_Ak';
      saveApiKey(defaultApiKey);
    }
  }, [isConfigured, saveApiKey]);
  
  // Handle pre-selected category from URL params
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    const subcategoryParam = searchParams.get('subcategory');
    
    if (categoryParam === 'transportation' && subcategoryParam === 'mileage') {
      setCategory('🚘 Transportation & Travel for Medical Care');
      setSubcategory('Mileage for car travel (67 cents/mile in 2024)');
    }
  }, [searchParams]);
  
  // For editing mode
  useEffect(() => {
    if (id) {
      const expenseToEdit = expenses.find(expense => expense.id === id);
      if (expenseToEdit) {
        setTitle(expenseToEdit.description || '');
        setAmount(expenseToEdit.amount.toString());
        setDate(new Date(expenseToEdit.date));
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
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!amount || !category) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    const expenseData: Expense = {
      id: id || `exp-${Date.now()}`,
      amount: parseFloat(amount),
      date: date.toISOString(),
      category,
      subcategory: subcategory || undefined,
      description: title || description,
      careRecipientId,
      careRecipientName: recipients.find(r => r.id === careRecipientId)?.name,
      receiptUrl,
      expense_tags: expenseTags.length > 0 ? expenseTags : undefined,
      is_tax_deductible: isTaxDeductible,
      reimbursement_source: reimbursementSource && reimbursementSource !== 'none' ? reimbursementSource : undefined,
      synced_transaction_id: linkedAccountId && linkedAccountId !== 'none' ? linkedAccountId : undefined
    };
    
    if (id) {
      // Update existing expense
      setExpenses(expenses.map(expense => 
        expense.id === id ? expenseData : expense
      ));
      toast({
        title: "Expense Updated",
        description: "Your expense has been updated successfully."
      });
    } else {
      // Add new expense
      setExpenses([...expenses, expenseData]);
      toast({
        title: "Expense Added!",
        description: "Your expense has been saved successfully."
      });
    }
    
    navigate('/expenses');
  };
  
  const handleDelete = () => {
    if (id) {
      setExpenses(expenses.filter(expense => expense.id !== id));
      toast({
        title: "Expense Deleted",
        description: "Your expense has been deleted successfully."
      });
      navigate('/expenses');
    }
  };

  const handleMileageAmountCalculated = (calculatedAmount: number) => {
    setAmount(calculatedAmount.toString());
  };

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
                />

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
                  onMileageAmountCalculated={handleMileageAmountCalculated}
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
