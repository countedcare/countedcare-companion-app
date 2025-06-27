
import React from 'react';
import { User } from '@/types/User';
import { Target, DollarSign } from 'lucide-react';

interface TrackingGoalsStepProps {
  user: User;
  setUser: (user: User) => void;
}

const TrackingGoalsStep: React.FC<TrackingGoalsStepProps> = ({ user, setUser }) => {
  return (
    <div>
      <div className="mb-6 text-center">
        <div className="bg-primary/10 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <Target className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-xl font-heading font-semibold mb-2">Track Your Caregiving Journey</h2>
        <p className="text-gray-600 text-sm">
          We'll help you track your caregiving expenses and provide insights for tax deductions and financial assistance.
        </p>
      </div>
      
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
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
