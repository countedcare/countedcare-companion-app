import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb, ChevronLeft, ChevronRight } from 'lucide-react';

export function AITipCard() {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  const tips = [
    {
      title: "Home Modifications",
      content: "Did you know home modifications like grab bars, ramps, and shower seats may qualify as medical deductions? Keep those receipts!"
    },
    {
      title: "Transportation Costs", 
      content: "Medical mileage is deductible at 22¢ per mile in 2023. Track trips to doctors, pharmacies, and medical facilities."
    },
    {
      title: "Insurance Premiums",
      content: "Long-term care insurance premiums may be deductible. The amount depends on age - older adults can deduct more."
    },
    {
      title: "Prescription Savings",
      content: "Over-the-counter medications are deductible when prescribed by a doctor. Ask for written prescriptions!"
    },
    {
      title: "Caregiver Expenses",
      content: "If you pay someone to care for your dependent while you work, it might qualify for the Child and Dependent Care Credit."
    },
    {
      title: "Medical Equipment",
      content: "Wheelchairs, hospital beds, and other durable medical equipment are fully deductible medical expenses."
    }
  ];

  // Auto-rotate tips every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % tips.length);
    }, 10000);

    return () => clearInterval(interval);
  }, [tips.length]);

  const nextTip = () => {
    setCurrentTipIndex((prev) => (prev + 1) % tips.length);
  };

  const prevTip = () => {
    setCurrentTipIndex((prev) => (prev - 1 + tips.length) % tips.length);
  };

  const currentTip = tips[currentTipIndex];

  return (
    <div className="px-4">
      <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-orange-50">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="bg-amber-100 p-3 rounded-full">
              <Lightbulb className="h-6 w-6 text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">💡 Today's Tax Tip</h3>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={prevTip}
                    className="h-8 w-8 p-0 hover:bg-amber-100"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-xs text-gray-500 px-2">
                    {currentTipIndex + 1} of {tips.length}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={nextTip}
                    className="h-8 w-8 p-0 hover:bg-amber-100"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">{currentTip.title}</h4>
              <p className="text-sm text-gray-700 leading-relaxed">{currentTip.content}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}