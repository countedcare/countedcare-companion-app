
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { PlusCircle, TrendingUp, Receipt, PieChart, ArrowRight } from 'lucide-react';
import Layout from '@/components/Layout';
import useLocalStorage from '@/hooks/useLocalStorage';
import { User, Expense, CareRecipient } from '@/types/User';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user] = useLocalStorage<User>('countedcare-user', {
    name: '',
    email: '',
    isCaregiver: true,
    onboardingComplete: false
  });
  
  const [expenses] = useLocalStorage<Expense[]>('countedcare-expenses', []);
  const [recipients] = useLocalStorage<CareRecipient[]>('countedcare-recipients', []);
  
  // Redirect to onboarding if not completed
  React.useEffect(() => {
    if (!user.onboardingComplete) {
      navigate('/');
    }
  }, [user, navigate]);

  // Calculate total expenses
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  // Mock data for the tax threshold (normally this would come from a calculation based on user income)
  const taxThreshold = 7500;
  const progressPercentage = Math.min((totalExpenses / taxThreshold) * 100, 100);
  
  // Get the latest expenses
  const latestExpenses = [...expenses].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  ).slice(0, 3);

  return (
    <Layout>
      <div className="container-padding py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-heading">Hi, {user.name || 'there'}!</h1>
          <p className="text-gray-600">Here's your caregiving expense summary</p>
        </div>

        {/* Main Stats Card */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Expense Summary</CardTitle>
            <CardDescription>
              Track your progress towards tax deduction threshold
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between mb-2">
              <span className="font-medium">${totalExpenses.toLocaleString()}</span>
              <span className="text-sm text-gray-500">Threshold: ${taxThreshold.toLocaleString()}</span>
            </div>
            <Progress value={progressPercentage} className="h-2 mb-4" />
            
            <div className="flex justify-between text-sm">
              <span>{progressPercentage.toFixed(0)}% of threshold</span>
              <span>${(taxThreshold - totalExpenses).toLocaleString()} to go</span>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Button 
            onClick={() => navigate('/expenses/new')} 
            className="flex-col h-24 bg-primary text-white"
          >
            <PlusCircle className="mb-1" size={24} />
            <span>Add Expense</span>
          </Button>
          <Button 
            onClick={() => navigate('/care-recipients/new')} 
            className="flex-col h-24 bg-accent text-accent-foreground"
          >
            <PlusCircle className="mb-1" size={24} />
            <span>Add Care Recipient</span>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <Receipt className="text-primary mb-2" size={24} />
              <span className="text-2xl font-semibold">{expenses.length}</span>
              <span className="text-sm text-gray-500">Total Expenses</span>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <PieChart className="text-primary mb-2" size={24} />
              <span className="text-2xl font-semibold">{recipients.length}</span>
              <span className="text-sm text-gray-500">Care Recipients</span>
            </CardContent>
          </Card>
        </div>

        {/* Latest Expenses */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Latest Expenses</CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/expenses')}
                className="text-primary"
              >
                View All
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {latestExpenses.length > 0 ? (
              <div className="space-y-3">
                {latestExpenses.map((expense) => (
                  <div 
                    key={expense.id} 
                    className="flex justify-between items-center p-3 bg-neutral rounded-md"
                  >
                    <div>
                      <div className="font-medium">{expense.description || expense.category}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(expense.date).toLocaleDateString()}
                        {expense.careRecipientName && ` • ${expense.careRecipientName}`}
                      </div>
                    </div>
                    <div className="font-medium">${expense.amount.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <p>No expenses recorded yet</p>
                <Button 
                  variant="outline" 
                  className="mt-2"
                  onClick={() => navigate('/expenses/new')}
                >
                  Add Your First Expense
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;
