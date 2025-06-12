
import React from 'react';
import { Receipt, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface CategoryTotal {
  name: string;
  value: number;
}

interface ExpenseAccountsListProps {
  categoryTotals: CategoryTotal[];
}

const ExpenseAccountsList = ({ categoryTotals }: ExpenseAccountsListProps) => {
  const navigate = useNavigate();

  const medicalTotal = categoryTotals.find(c => c.name === 'Medical Care')?.value || 0;
  const careTotal = categoryTotals.find(c => c.name === 'In-Home Care')?.value || 0;

  const getMedicalMessage = () => {
    if (medicalTotal === 0) return "Ready to track medical expenses? 🏥";
    if (medicalTotal < 500) return "Every medical expense counts! 💊";
    return "Building your medical expense record! 📋";
  };

  const getCareMessage = () => {
    if (careTotal === 0) return "Track care services here 🤲";
    if (careTotal < 1000) return "Great job documenting care costs! 👏";
    return "You're doing amazing! 🌟";
  };

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-medium">Your Expense Categories</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate('/expenses/new')}
          className="text-primary border-primary hover:bg-primary hover:text-white transition-colors"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Expense
        </Button>
      </div>
      <div className="space-y-3">
        <Card className="bg-neutral hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex justify-between items-center">
            <div className="flex items-center">
              <div className="bg-primary/10 p-2 rounded-full">
                <Receipt className="h-5 w-5 text-primary" />
              </div>
              <div className="ml-3">
                <h3 className="font-medium">Medical Expenses</h3>
                <p className="text-sm text-muted-foreground">
                  ${medicalTotal.toLocaleString()} • {getMedicalMessage()}
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-primary border-primary hover:bg-primary hover:text-white transition-colors" 
              onClick={() => navigate('/expenses')}
            >
              View
            </Button>
          </CardContent>
        </Card>
        
        <Card className="bg-neutral hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex justify-between items-center">
            <div className="flex items-center">
              <div className="bg-primary/10 p-2 rounded-full">
                <Receipt className="h-5 w-5 text-primary" />
              </div>
              <div className="ml-3">
                <h3 className="font-medium">In-Home Care</h3>
                <p className="text-sm text-muted-foreground">
                  ${careTotal.toLocaleString()} • {getCareMessage()}
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-primary border-primary hover:bg-primary hover:text-white transition-colors" 
              onClick={() => navigate('/expenses')}
            >
              View
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ExpenseAccountsList;
