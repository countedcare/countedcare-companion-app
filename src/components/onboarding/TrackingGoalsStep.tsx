
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { User, PRIMARY_CAREGIVING_EXPENSES } from '@/types/User';
import { Target, DollarSign } from 'lucide-react';

interface TrackingGoalsStepProps {
  user: User;
  setUser: (user: User) => void;
}

const TrackingGoalsStep: React.FC<TrackingGoalsStepProps> = ({ user, setUser }) => {
  const updateArrayField = (field: keyof User, value: string, checked: boolean) => {
    const currentArray = (user[field] as string[]) || [];
    if (checked) {
      setUser({ ...user, [field]: [...currentArray, value] });
    } else {
      setUser({ ...user, [field]: currentArray.filter(item => item !== value) });
    }
  };

  return (
    <div>
      <div className="mb-6 text-center">
        <div className="bg-primary/10 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <Target className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-xl font-heading font-semibold mb-2">What expenses do you want to track?</h2>
        <p className="text-gray-600 text-sm">
          Select the types of caregiving expenses you regularly have. This helps us provide better insights and tax guidance.
        </p>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-3">
          <Label className="text-base font-medium text-gray-800">Primary Caregiving Expenses</Label>
          <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto">
            {PRIMARY_CAREGIVING_EXPENSES.map(expense => (
              <div key={expense} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                <Checkbox
                  id={expense}
                  checked={(user.primaryCaregivingExpenses || []).includes(expense)}
                  onCheckedChange={(checked) => updateArrayField('primaryCaregivingExpenses', expense, checked as boolean)}
                />
                <Label htmlFor={expense} className="text-sm text-gray-700 flex-1 cursor-pointer">
                  {expense}
                </Label>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <div className="flex items-start space-x-3">
            <DollarSign className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-blue-900 mb-1">Tax Deduction Tracking</h3>
              <p className="text-sm text-blue-800">
                We'll help you identify which expenses may qualify for tax deductions based on IRS guidelines and your income level.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackingGoalsStep;
