import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSupabaseProfile } from '@/hooks/useSupabaseProfile';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calculator, TrendingUp, FileText, Download, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

const Deductions = () => {
  const { user } = useAuth();
  const { profile } = useSupabaseProfile();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // SEO
  React.useEffect(() => {
    document.title = 'Tax Deductions – CountedCare';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Track your potential tax deductions and medical expense thresholds.');
  }, []);

  useEffect(() => {
    const fetchExpenses = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('expenses')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false });

        if (error) throw error;
        setExpenses(data || []);
      } catch (error) {
        console.error('Error fetching expenses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, [user]);

  if (loading || !profile) {
    return (
      <Layout>
        <div className="container-padding py-6 flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  // Calculate deduction data
  const currentYear = new Date().getFullYear();
  const householdAGI = profile?.household_agi || 75000;
  const threshold = householdAGI * 0.075;

  const thisYearExpenses = expenses.filter(expense => 
    new Date(expense.date).getFullYear() === currentYear
  );

  const deductibleExpenses = thisYearExpenses.filter(expense => 
    expense.is_tax_deductible
  );

  const totalDeductible = deductibleExpenses.reduce((sum, expense) => 
    sum + expense.amount, 0
  );

  const unlockedDeductions = Math.max(0, totalDeductible - threshold);
  const progressPercent = Math.min(100, (totalDeductible / threshold) * 100);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 pb-24">
        <div className="space-y-6 px-4 pt-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Tax Deductions</h1>
            <p className="text-gray-600">Track your potential medical expense deductions for {currentYear}</p>
          </div>

          {/* Progress Overview */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-900">
                <Calculator className="h-6 w-6 mr-3 text-emerald-600" />
                Deduction Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Progress Bar */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">Medical expenses tracked</span>
                  <span className="text-lg font-bold text-gray-900">{formatCurrency(totalDeductible)}</span>
                </div>
                <Progress value={progressPercent} className="h-4" />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>IRS 7.5% AGI Threshold: {formatCurrency(threshold)}</span>
                  <span>{Math.round(progressPercent)}%</span>
                </div>
              </div>

              {/* Unlocked Amount */}
              {unlockedDeductions > 0 ? (
                <div className="bg-gradient-to-r from-emerald-100 to-green-100 rounded-xl p-6 border border-emerald-200">
                  <div className="flex items-center space-x-3 mb-3">
                    <Sparkles className="h-6 w-6 text-emerald-600" />
                    <h3 className="text-xl font-bold text-emerald-800">
                      {formatCurrency(unlockedDeductions)} Potential Deduction
                    </h3>
                  </div>
                  <p className="text-emerald-700">
                    These medical expenses exceed your AGI threshold and may be tax deductible. 
                    Consult with a tax professional for guidance.
                  </p>
                </div>
              ) : (
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                  <h3 className="font-semibold text-blue-800 mb-2">Keep tracking!</h3>
                  <p className="text-blue-700">
                    You need {formatCurrency(threshold - totalDeductible)} more in medical expenses 
                    to reach the IRS deduction threshold.
                  </p>
                </div>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{deductibleExpenses.length}</div>
                  <div className="text-xs text-gray-600">Deductible items</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600">{formatCurrency(totalDeductible)}</div>
                  <div className="text-xs text-gray-600">Total tracked</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">${householdAGI.toLocaleString()}</div>
                  <div className="text-xs text-gray-600">Household AGI</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Deductible Expenses List */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center text-gray-900">
                  <FileText className="h-5 w-5 mr-2 text-gray-600" />
                  Deductible Expenses ({currentYear})
                </CardTitle>
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  {deductibleExpenses.length} items
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {deductibleExpenses.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No deductible expenses tracked yet</p>
                  <p className="text-sm">Add expenses and mark them as tax deductible</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {deductibleExpenses.map((expense) => (
                    <div
                      key={expense.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="font-medium text-gray-900">
                            {expense.vendor || expense.description || 'Medical Expense'}
                          </div>
                          <Badge 
                            variant="outline" 
                            className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                          >
                            {expense.category}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {format(new Date(expense.date), 'MMM d, yyyy')}
                          {expense.notes && (
                            <span className="ml-2">• {expense.notes}</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">
                          {formatCurrency(expense.amount)}
                        </div>
                        {expense.synced_transaction_id && (
                          <Badge variant="secondary" className="text-xs mt-1">
                            Auto-imported
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Export Button */}
              {deductibleExpenses.length > 0 && (
                <div className="pt-4 border-t">
                  <Button variant="outline" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Export Tax Summary
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tax Tips */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-900">
                <TrendingUp className="h-5 w-5 mr-2 text-amber-600" />
                Tax Planning Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-700">
                    <strong>7.5% AGI Rule:</strong> Only medical expenses exceeding 7.5% of your AGI are deductible.
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-700">
                    <strong>Keep Records:</strong> Save all receipts and documentation for tax deductible expenses.
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-700">
                    <strong>Consult a Professional:</strong> Always verify with a tax professional before claiming deductions.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Deductions;