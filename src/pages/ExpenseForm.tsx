
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
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import Layout from '@/components/Layout';
import useLocalStorage from '@/hooks/useLocalStorage';
import { Expense, CareRecipient } from '@/types/User';

// IRS Publication 502 categories
const expenseCategories = [
  'Doctor Visits',
  'Hospital Services',
  'Prescriptions',
  'Medical Equipment',
  'Dental Care',
  'Vision Care',
  'Therapy',
  'Transportation',
  'Home Care',
  'Nursing Services',
  'Long-term Care',
  'Insurance Premiums',
  'Other Medical'
];

const ExpenseForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [expenses, setExpenses] = useLocalStorage<Expense[]>('countedcare-expenses', []);
  const [recipients] = useLocalStorage<CareRecipient[]>('countedcare-recipients', []);
  
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [careRecipientId, setCareRecipientId] = useState('');
  
  // For editing mode
  useEffect(() => {
    if (id) {
      const expenseToEdit = expenses.find(expense => expense.id === id);
      if (expenseToEdit) {
        setAmount(expenseToEdit.amount.toString());
        setDate(new Date(expenseToEdit.date));
        setCategory(expenseToEdit.category);
        setDescription(expenseToEdit.description || '');
        setCareRecipientId(expenseToEdit.careRecipientId);
      }
    }
  }, [id, expenses]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!amount || !category || !careRecipientId) {
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
      description,
      careRecipientId,
      careRecipientName: recipients.find(r => r.id === careRecipientId)?.name
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
        title: "Expense Added",
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
  
  return (
    <Layout>
      <div className="container-padding py-6">
        <h1 className="text-2xl font-heading mb-6">
          {id ? 'Edit' : 'Add'} Expense
        </h1>
        
        <form onSubmit={handleSubmit}>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
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
                      {expenseCategories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter expense details"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="recipient">Care Recipient*</Label>
                  {recipients.length > 0 ? (
                    <Select 
                      value={careRecipientId} 
                      onValueChange={setCareRecipientId}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select care recipient" />
                      </SelectTrigger>
                      <SelectContent>
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
              </div>
              
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
