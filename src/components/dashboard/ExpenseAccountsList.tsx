
import React from 'react';
import { Receipt } from 'lucide-react';
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

  return (
    <div className="mb-6">
      <h2 className="text-lg font-medium mb-3">Expense Accounts</h2>
      <div className="space-y-3">
        <Card className="bg-neutral">
          <CardContent className="p-4 flex justify-between items-center">
            <div className="flex items-center">
              <div className="bg-primary/10 p-2 rounded-full">
                <Receipt className="h-5 w-5 text-primary" />
              </div>
              <div className="ml-3">
                <h3 className="font-medium">Medical Expenses</h3>
                <p className="text-sm text-muted-foreground">{(categoryTotals.find(c => c.name === 'Medical Care')?.value || 0).toLocaleString()}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="text-primary border-primary" onClick={() => navigate('/expenses')}>
              View
            </Button>
          </CardContent>
        </Card>
        
        <Card className="bg-neutral">
          <CardContent className="p-4 flex justify-between items-center">
            <div className="flex items-center">
              <div className="bg-primary/10 p-2 rounded-full">
                <Receipt className="h-5 w-5 text-primary" />
              </div>
              <div className="ml-3">
                <h3 className="font-medium">In-Home Care</h3>
                <p className="text-sm text-muted-foreground">{(categoryTotals.find(c => c.name === 'In-Home Care')?.value || 0).toLocaleString()}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="text-primary border-primary" onClick={() => navigate('/expenses')}>
              View
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ExpenseAccountsList;
