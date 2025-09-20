import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';
import { Calendar, MapPin, Calculator, Save, Trash2 } from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseCareRecipients } from '@/hooks/useSupabaseCareRecipients';
import { useLinkedAccounts } from '@/hooks/useLinkedAccounts';

// Import mileage-specific components
import ExpenseBasicFields from '@/components/expenses/ExpenseBasicFields';
import MileageCalculator from '@/components/expenses/MileageCalculator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import useGoogleMapsAPI from '@/hooks/useGoogleMapsAPI';

const MileageForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user: authUser } = useAuth();
  const { recipients } = useSupabaseCareRecipients();
  const { accounts: linkedAccounts } = useLinkedAccounts();
  const { apiKey } = useGoogleMapsAPI();
  
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Mileage-specific form fields
  const [title, setTitle] = useState('Medical Mileage');
  const [amount, setAmount] = useState('');
  const [sourceAccountId, setSourceAccountId] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  const [careRecipientId, setCareRecipientId] = useState('');
  const [description, setDescription] = useState('');
  
  // Fixed category and subcategory for mileage
  const category = 'Transportation & Travel';
  const subcategory = 'Car Mileage & Expenses';
  
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
      
      setExpenses(data || []);
    } catch (error) {
      console.error('Error loading mileage expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, [authUser]);
  
  // For editing mode
  useEffect(() => {
    if (id && expenses.length > 0) {
      const expenseToEdit = expenses.find(expense => expense.id === id);
      if (expenseToEdit) {
        setTitle(expenseToEdit.description || 'Medical Mileage');
        setAmount(expenseToEdit.amount?.toString() || '');
        setDescription(expenseToEdit.description || '');
        setCareRecipientId(expenseToEdit.care_recipient_id || '');
        setSourceAccountId(expenseToEdit.linked_account_id || '');
        if (expenseToEdit.date) {
          setDate(new Date(expenseToEdit.date));
        }
      }
    }
  }, [id, expenses]);

  const handleMileageAmountCalculated = (calculatedAmount: number) => {
    setAmount(calculatedAmount.toString());
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!authUser) {
      toast({
        title: "Error",
        description: "You must be logged in to save mileage",
        variant: "destructive"
      });
      return;
    }
    
    // Validate required fields
    if (!amount) {
      toast({
        title: "Missing Information",
        description: "Please calculate your mileage amount first.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const expenseData = {
        amount: parseFloat(amount),
        date: date.toISOString().split('T')[0], // Convert to date string
        category,
        subcategory,
        description: title,
        vendor: null, // Mileage doesn't have vendors
        user_id: authUser.id,
        care_recipient_id: careRecipientId || null,
        receipt_url: null, // Mileage doesn't need receipts
        notes: description || null,
        linked_account_id: sourceAccountId || null,
      };

      if (id) {
        // Update existing mileage expense
        const { error } = await supabase
          .from('expenses')
          .update(expenseData)
          .eq('id', id)
          .eq('user_id', authUser.id);

        if (error) throw error;
        
        toast({
          title: "Mileage Updated",
          description: "Your mileage expense has been updated successfully."
        });
      } else {
        // Create new mileage expense
        const { error } = await supabase
          .from('expenses')
          .insert([expenseData]);

        if (error) throw error;
        
        toast({
          title: "Mileage Added!",
          description: "Your mileage expense has been saved successfully."
        });
      }

      navigate('/expenses');
    } catch (error) {
      console.error('Error saving mileage expense:', error);
      toast({
        title: "Error",
        description: "Failed to save mileage expense. Please try again.",
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
        title: "Mileage Delete",
        description: "Your mileage expense has been deleted successfully."
      });
      
      navigate('/expenses');
    } catch (error) {
      console.error('Error deleting mileage expense:', error);
      toast({
        title: "Error",
        description: "Failed to delete mileage expense. Please try again.",
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
          <div>
            <h1 className="text-2xl font-heading flex items-center gap-2">
              <MapPin className="h-6 w-6 text-primary" />
              {id ? 'Edit' : 'Track'} Medical Mileage
            </h1>
            <p className="text-muted-foreground mt-1">
              Track mileage for medical appointments at $0.21 per mile
            </p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Basic Information Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Trip Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
                  amountReadOnly={true}
                  amountNote="Calculated from mileage at $0.21/mi"
                />

                {/* Care Recipient Selection */}
                <div className="space-y-2">
                  <Label htmlFor="care-recipient">Who was this trip for?</Label>
                  <Select value={careRecipientId} onValueChange={setCareRecipientId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select who this trip was for" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="self">Myself</SelectItem>
                      {recipients.filter(recipient => recipient.id?.trim()).map((recipient) => (
                        <SelectItem key={recipient.id} value={recipient.id}>
                          {recipient.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Mileage Calculator Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Calculate Mileage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MileageCalculator 
                  onAmountCalculated={handleMileageAmountCalculated}
                  apiKey={apiKey}
                />
              </CardContent>
            </Card>

            {/* Notes Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Additional Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="notes">Trip Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="e.g., Doctor appointment at UCLA Health, Physical therapy session"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center justify-between mt-8">
            <div>
              {id && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Mileage
                </Button>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/expenses')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex items-center gap-2"
                disabled={!amount}
              >
                <Save className="h-4 w-4" />
                {id ? 'Update' : 'Save'} Mileage
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default MileageForm;