
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/components/ui/use-toast';
import { CalendarIcon, Upload, Scan, FileText, Loader2, Camera } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import Layout from '@/components/Layout';
import useLocalStorage from '@/hooks/useLocalStorage';
import { Expense, CareRecipient, EXPENSE_CATEGORIES } from '@/types/User';
import EnhancedExpenseFields from '@/components/expenses/EnhancedExpenseFields';
import CameraCapture from '@/components/mobile/CameraCapture';
import CategorySelector from '@/components/expenses/CategorySelector';
import { supabase } from '@/integrations/supabase/client';
import MedicalPlacesAutocomplete from '@/components/places/MedicalPlacesAutocomplete';
import useGoogleMapsAPI from '@/hooks/useGoogleMapsAPI';

const ExpenseForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
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

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const processDocumentWithGemini = async (file: File) => {
    try {
      setIsProcessingDocument(true);
      
      toast({
        title: "Processing Document",
        description: "Extracting expense data from your document..."
      });

      const base64Data = await convertFileToBase64(file);
      
      const { data, error } = await supabase.functions.invoke('gemini-receipt-ocr', {
        body: { imageBase64: base64Data }
      });

      if (error) {
        console.error('OCR processing error:', error);
        throw new Error(error.message || 'Failed to process document');
      }

      if (data?.success && data?.data) {
        handleReceiptProcessed(data.data);
        toast({
          title: "Document Processed!",
          description: "Expense data extracted successfully from your document"
        });
      } else {
        throw new Error('Failed to extract data from document');
      }
    } catch (error) {
      console.error('Error processing document:', error);
      toast({
        title: "Processing Error", 
        description: "Could not extract data from document. You can still add the expense manually.",
        variant: "destructive"
      });
    } finally {
      setIsProcessingDocument(false);
    }
  };

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
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    
    // Create object URL for preview
    const fileUrl = URL.createObjectURL(file);
    setReceiptUrl(fileUrl);

    // Process with Gemini AI for expense data extraction if it's an image or document
    if (file.type.startsWith('image/') || file.type === 'application/pdf') {
      await processDocumentWithGemini(file);
    }
    
    setIsUploading(false);
    
    toast({
      title: "Receipt Uploaded",
      description: "Your receipt has been attached to this expense."
    });
  };
  
  const handleScan = () => {
    // Simulate scanning with camera
    setIsUploading(true);
    
    toast({
      title: "Accessing Camera",
      description: "Please allow camera access to scan your receipt."
    });
    
    // Simulate delay for scanning
    setTimeout(() => {
      // In a real app, this would use the device camera API
      // For now, we'll just set a placeholder image
      setReceiptUrl("/placeholder.svg");
      setIsUploading(false);
      
      toast({
        title: "Receipt Scanned",
        description: "Your receipt has been scanned and attached to this expense."
      });
    }, 1500);
  };
  
  const removeReceipt = () => {
    setReceiptUrl(undefined);
    toast({
      title: "Receipt Removed",
      description: "The receipt has been removed from this expense."
    });
  };

  const handleLocationSelect = (place: google.maps.places.PlaceResult) => {
    setSelectedLocation(place);
    console.log('Selected location:', place);
    
    // Auto-populate title if it's empty
    if (!title && place.name) {
      setTitle(place.name);
    }
    
    toast({
      title: "Location Selected",
      description: `Added ${place.name || place.formatted_address} to your expense`
    });
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
                  />
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

                {/* Location Search */}
                <div className="space-y-2">
                  <MedicalPlacesAutocomplete
                    onPlaceSelect={handleLocationSelect}
                    apiKey={apiKey}
                  />
                  
                  {selectedLocation && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-blue-900">
                            {selectedLocation.name}
                          </h4>
                          <p className="text-sm text-blue-700 mt-1">
                            {selectedLocation.formatted_address}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedLocation(null)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Enhanced Category Selector */}
                <CategorySelector
                  category={category}
                  subcategory={subcategory}
                  onCategoryChange={setCategory}
                  onSubcategoryChange={setSubcategory}
                  required
                />
                
                {/* Care Recipient */}
                <div className="space-y-2">
                  <Label htmlFor="recipient">Who this is for</Label>
                  {recipients.length > 0 ? (
                    <Select 
                      value={careRecipientId} 
                      onValueChange={setCareRecipientId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select care recipient" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="self">Self</SelectItem>
                        {recipients.map(recipient => (
                          <SelectItem key={recipient.id} value={recipient.id}>
                            {recipient.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="mt-2 mb-4">
                      <p className="text-sm text-gray-500 mb-2">
                        No care recipients added yet. Add one first:
                      </p>
                      <Button 
                        type="button"
                        onClick={() => navigate('/care-recipients/new')}
                        className="w-full"
                      >
                        Add Care Recipient
                      </Button>
                    </div>
                  )}
                </div>

                {/* Consolidated Receipt Upload Section */}
                <div className="space-y-2">
                  <Label>Receipt & Document Upload</Label>
                  
                  {!receiptUrl ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                      <div className="text-center space-y-4">
                        <FileText className="mx-auto h-12 w-12 text-gray-400" />
                        <div>
                          <h3 className="text-lg font-medium mb-2">Add Receipt or Document</h3>
                          <p className="text-sm text-gray-600 mb-1">
                            Upload receipts, invoices, or expense documents
                          </p>
                          <p className="text-xs text-gray-500 mb-4">
                            AI will automatically extract expense details
                          </p>
                        </div>
                        
                        {/* Smart Camera Capture */}
                        <div className="mb-4">
                          <CameraCapture
                            onImageCaptured={(imageUri, photo) => {
                              setReceiptUrl(imageUri);
                            }}
                            onReceiptProcessed={handleReceiptProcessed}
                            disabled={isUploading || isProcessingDocument}
                          />
                        </div>

                        {/* Upload Options */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <input
                              type="file"
                              id="receipt-upload"
                              accept="image/*,.pdf,.doc,.docx"
                              onChange={handleFileUpload}
                              className="hidden"
                              disabled={isUploading || isProcessingDocument}
                            />
                            <label htmlFor="receipt-upload">
                              <Button
                                type="button"
                                variant="outline"
                                className="w-full cursor-pointer"
                                asChild
                                disabled={isUploading || isProcessingDocument}
                              >
                                <div>
                                  {isProcessingDocument ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  ) : (
                                    <Upload className="mr-2 h-4 w-4" />
                                  )}
                                  {isProcessingDocument ? 'Processing...' : 'Upload File'}
                                </div>
                              </Button>
                            </label>
                          </div>
                          
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleScan}
                            disabled={isUploading || isProcessingDocument}
                            className="w-full"
                          >
                            <Scan className="mr-2 h-4 w-4" />
                            Scan Receipt
                          </Button>
                        </div>
                        
                        {(isUploading || isProcessingDocument) && (
                          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                            <div className="flex items-center justify-center gap-2">
                              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                              <span className="text-sm text-blue-700">
                                {isProcessingDocument ? 'AI is reading your document...' : 'Uploading...'}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Receipt Display */
                    <div className="border rounded-md p-3">
                      <div className="aspect-[4/3] bg-muted rounded-md mb-3 overflow-hidden">
                        <img 
                          src={receiptUrl} 
                          alt="Receipt" 
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={removeReceipt}
                        className="w-full"
                      >
                        Remove Receipt
                      </Button>
                    </div>
                  )}
                </div>
                
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
              
              {/* Form Buttons */}
              <div className="mt-6 space-y-3">
                <Button type="submit" className="w-full bg-primary">
                  {id ? 'Update' : 'Save'} Expense
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/expenses')} 
                  className="w-full"
                >
                  Cancel
                </Button>
                
                {id && (
                  <Button 
                    type="button" 
                    variant="destructive" 
                    onClick={handleDelete} 
                    className="w-full"
                  >
                    Delete Expense
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </Layout>
  );
};

export default ExpenseForm;
