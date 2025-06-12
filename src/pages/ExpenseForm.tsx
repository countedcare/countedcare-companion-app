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
import { CalendarIcon, Upload, Receipt, Scan, FileImage } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import Layout from '@/components/Layout';
import useLocalStorage from '@/hooks/useLocalStorage';
import { Expense, CareRecipient, EXPENSE_CATEGORIES } from '@/types/User';
import EnhancedExpenseFields from '@/components/expenses/EnhancedExpenseFields';

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
  const [description, setDescription] = useState('');
  const [careRecipientId, setCareRecipientId] = useState('');
  const [receiptUrl, setReceiptUrl] = useState<string | undefined>(undefined);
  const [isUploading, setIsUploading] = useState(false);
  
  // Enhanced tracking fields
  const [expenseTags, setExpenseTags] = useState<string[]>([]);
  const [isTaxDeductible, setIsTaxDeductible] = useState(false);
  const [reimbursementSource, setReimbursementSource] = useState('');
  const [linkedAccountId, setLinkedAccountId] = useState('');
  
  // For editing mode
  useEffect(() => {
    if (id) {
      const expenseToEdit = expenses.find(expense => expense.id === id);
      if (expenseToEdit) {
        setTitle(expenseToEdit.description || '');
        setAmount(expenseToEdit.amount.toString());
        setDate(new Date(expenseToEdit.date));
        setCategory(expenseToEdit.category);
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
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    
    // Simulate file upload with a delay
    setTimeout(() => {
      // Create object URL for preview
      const fileUrl = URL.createObjectURL(file);
      setReceiptUrl(fileUrl);
      setIsUploading(false);
      
      toast({
        title: "Receipt Uploaded",
        description: "Your receipt has been attached to this expense."
      });
    }, 1000);
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
  
  return (
    <Layout>
      <div className="container-padding py-6">
        <h1 className="text-2xl font-heading mb-6">
          {id ? 'Edit' : 'Add New'} Expense
        </h1>
        
        <form onSubmit={handleSubmit}>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Expense Title */}
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
                
                {/* Amount */}
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
                
                {/* Date */}
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
                
                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="category">Category*</Label>
                  <Select 
                    value={category} 
                    onValueChange={setCategory}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPENSE_CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
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
                
                {/* Receipt Upload Section */}
                <div className="space-y-2">
                  <Label>Receipt</Label>
                  
                  {receiptUrl ? (
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
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <input
                          type="file"
                          id="receipt-upload"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                          disabled={isUploading}
                        />
                        <label htmlFor="receipt-upload">
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full cursor-pointer"
                            asChild
                            disabled={isUploading}
                          >
                            <div>
                              <Upload className="mr-2 h-4 w-4" />
                              Upload Receipt
                            </div>
                          </Button>
                        </label>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleScan}
                        disabled={isUploading}
                        className="w-full"
                      >
                        <Scan className="mr-2 h-4 w-4" />
                        Scan Receipt
                      </Button>
                    </div>
                  )}
                  
                  {isUploading && (
                    <div className="text-center py-3">
                      <div className="animate-pulse text-sm text-gray-500">
                        Processing receipt...
                      </div>
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
