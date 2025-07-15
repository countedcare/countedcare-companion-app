import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Receipt, FileText } from 'lucide-react';
import Layout from '@/components/Layout';
import useLocalStorage from '@/hooks/useLocalStorage';
import { User, Expense } from '@/types/User';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ReceiptCaptureModal from '@/components/ReceiptCaptureModal';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [user] = useLocalStorage<User>('countedcare-user', {
    name: '',
    email: '',
    isCaregiver: true,
    onboardingComplete: false
  });
  
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Redirect to onboarding if not completed
  React.useEffect(() => {
    if (!user.onboardingComplete) {
      navigate('/');
    }
  }, [user, navigate]);

  // Load expenses from Supabase
  const loadExpenses = async () => {
    if (!authUser) return;
    
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

  // Auto-show receipt modal on first visit
  useEffect(() => {
    if (!loading && expenses.length === 0) {
      setShowReceiptModal(true);
    }
  }, [loading, expenses.length]);

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const potentiallyDeductible = expenses.filter(e => e.is_potentially_deductible === true).length;
  
  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
      <div className="container-padding py-6 space-y-6">
        {/* Simplified Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-heading text-foreground">
            Welcome back, {user.name || 'Caregiver'}
          </h1>
          <p className="text-muted-foreground">
            Track your caregiving expenses and discover tax deductions
          </p>
        </div>

        {/* Main CTA - Always prominent */}
        <Card className="border-primary/20">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Receipt className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-2">
                <h2 className="text-lg font-semibold">Add an Expense</h2>
                <p className="text-sm text-muted-foreground">
                  Upload a receipt or enter expense details manually
                </p>
              </div>
              <Button 
                onClick={() => setShowReceiptModal(true)}
                size="lg"
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Expense
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Simple Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Tracked
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div>
              <p className="text-xs text-muted-foreground">
                {expenses.length} expense{expenses.length !== 1 ? 's' : ''}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Potential Deductions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{potentiallyDeductible}</div>
              <p className="text-xs text-muted-foreground">
                might qualify for tax deductions
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {expenses.length > 0 ? 
                  new Date(expenses[0]?.created_at || expenses[0]?.date || '').toLocaleDateString() : 
                  'None'
                }
              </div>
              <p className="text-xs text-muted-foreground">
                last expense added
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Expenses */}
        {expenses.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Recent Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {expenses.slice(0, 5).map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{expense.category}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(expense.date).toLocaleDateString()}
                        {expense.description && ` • ${expense.description}`}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(expense.amount)}</div>
                      {expense.is_potentially_deductible === true && (
                        <div className="text-xs text-green-600">Potentially deductible</div>
                      )}
                    </div>
                  </div>
                ))}
                
                {expenses.length > 5 && (
                  <Button
                    variant="outline"
                    onClick={() => navigate('/expenses')}
                    className="w-full"
                  >
                    View all {expenses.length} expenses
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      <ReceiptCaptureModal
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
        onExpenseAdded={() => {
          loadExpenses();
          setShowReceiptModal(false);
        }}
      />
    </Layout>
  );
};

export default Dashboard;
