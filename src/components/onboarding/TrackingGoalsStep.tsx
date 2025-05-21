
import React from 'react';

const TrackingGoalsStep: React.FC = () => {
  return (
    <div>
      <h2 className="text-xl font-heading mb-4">Tracking Goals</h2>
      <p className="mb-4 text-gray-600">
        CountedCare helps you track medical expenses that may qualify for tax deductions under IRS Publication 502.
      </p>
      <div className="bg-accent/20 p-4 rounded-md mb-4">
        <p className="font-medium text-gray-800">
          Medical expenses above 7.5% of your adjusted gross income may qualify for tax deductions.
        </p>
      </div>
      <p className="text-gray-600 mb-4">
        We'll help you organize receipts and track expenses to maximize your tax benefits.
      </p>
      <div className="bg-primary/10 p-4 rounded-md">
        <p className="text-sm">
          <span className="font-medium">Did you know?</span> Caregivers spend 26% of their income on care expenses on average.
        </p>
      </div>
    </div>
  );
};

export default TrackingGoalsStep;
