import React from "react";
import MileageCalculator from "@/components/expenses/MileageCalculator";

export default function MileageForm() {
  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Calculate Mileage</h1>
        <p className="text-gray-600">Track your travel expenses for medical care</p>
      </div>
      
      <MileageCalculator 
        onAmountCalculated={(amount) => {
          // Amount calculated successfully
        }}
      />
    </div>
  );
}