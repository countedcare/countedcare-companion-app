
import React from 'react';
import { CheckCircle, ArrowRight, Heart } from 'lucide-react';

interface CompletionStepProps {
  userName: string;
}

const CompletionStep: React.FC<CompletionStepProps> = ({ userName }) => {
  return (
    <div className="text-center">
      <div className="mb-6">
        <div className="bg-green-100 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-heading font-semibold mb-2">
          You're all set, {userName}! 🎉
        </h2>
        <p className="text-gray-600 text-lg">
          Welcome to your caregiving expense tracking journey
        </p>
      </div>
      
      <div className="bg-gradient-to-r from-blue-50 to-accent-light rounded-lg p-6 mb-6">
        <h3 className="font-semibold text-gray-800 mb-3">What happens next?</h3>
        <div className="space-y-3 text-left">
          <div className="flex items-center space-x-3">
            <div className="bg-white rounded-full p-1">
              <ArrowRight className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm text-gray-700">Start adding your caregiving expenses</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="bg-white rounded-full p-1">
              <ArrowRight className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm text-gray-700">Track your progress toward tax deduction thresholds</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="bg-white rounded-full p-1">
              <ArrowRight className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm text-gray-700">Get personalized insights and recommendations</span>
          </div>
        </div>
      </div>
      
      <div className="bg-primary/10 rounded-lg p-4">
        <div className="flex items-center justify-center space-x-2 text-primary">
          <Heart className="h-5 w-5" />
          <span className="font-medium">You're making a difference</span>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Every expense you track is a step toward better financial health for your family
        </p>
      </div>
    </div>
  );
};

export default CompletionStep;
