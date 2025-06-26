
import React from 'react';
import { Heart, Shield, TrendingUp } from 'lucide-react';

const WelcomeStep: React.FC = () => {
  return (
    <div className="text-center">
      <div className="mb-6">
        <div className="bg-primary/10 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
          <Heart className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-2xl font-heading font-semibold mb-2">Welcome to CountedCare</h2>
        <p className="text-gray-600 text-lg">
          Your personal assistant for managing caregiving expenses and maximizing tax benefits
        </p>
      </div>
      
      <div className="space-y-4 text-left">
        <div className="flex items-start space-x-3">
          <div className="bg-green-100 rounded-full p-2 mt-1">
            <TrendingUp className="h-4 w-4 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Track Tax-Deductible Expenses</h3>
            <p className="text-sm text-gray-600">Automatically categorize medical and caregiving expenses that may qualify for tax deductions</p>
          </div>
        </div>
        
        <div className="flex items-start space-x-3">
          <div className="bg-blue-100 rounded-full p-2 mt-1">
            <Shield className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Secure & Private</h3>
            <p className="text-sm text-gray-600">Your financial data stays on your device. We prioritize your privacy and security</p>
          </div>
        </div>
        
        <div className="flex items-start space-x-3">
          <div className="bg-purple-100 rounded-full p-2 mt-1">
            <Heart className="h-4 w-4 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Built for Caregivers</h3>
            <p className="text-sm text-gray-600">Designed specifically for the unique challenges of family caregiving</p>
          </div>
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-accent/20 rounded-lg">
        <p className="text-sm text-gray-700">
          <span className="font-medium">Quick setup:</span> This will only take 2-3 minutes to get you started
        </p>
      </div>
    </div>
  );
};

export default WelcomeStep;
