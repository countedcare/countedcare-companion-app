import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { TrendingUp, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProgressTrackerProps {
  profile: any;
}

export function ProgressTracker({ profile }: ProgressTrackerProps) {
  const navigate = useNavigate();
  
  // Calculate AGI threshold (7.5% for medical expenses)
  const householdAGI = profile?.household_agi || 75000;
  const threshold = householdAGI * 0.075;
  
  // Mock current tracked amount - this would come from expenses
  const currentTracked = 3200;
  const progressPercent = Math.min(100, (currentTracked / threshold) * 100);
  const unlockedDeductions = Math.max(0, currentTracked - threshold);

  return (
    <div className="px-4">
      <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-blue-50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center text-gray-900">
            <TrendingUp className="h-5 w-5 mr-2 text-emerald-600" />
            Tax Savings Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Medical expenses tracked</span>
              <span className="font-semibold">${currentTracked.toLocaleString()}</span>
            </div>
            <Progress value={progressPercent} className="h-3" />
            <div className="flex justify-between text-xs text-gray-500">
              <span>IRS 7.5% AGI Threshold: ${threshold.toLocaleString()}</span>
              <span>{Math.round(progressPercent)}%</span>
            </div>
          </div>

          {/* Unlocked Deductions */}
          {unlockedDeductions > 0 ? (
            <div className="bg-gradient-to-r from-emerald-100 to-green-100 rounded-xl p-4 border border-emerald-200">
              <div className="flex items-center space-x-2 mb-2">
                <Sparkles className="h-5 w-5 text-emerald-600" />
                <span className="font-semibold text-emerald-800">
                  🎉 You've unlocked ${unlockedDeductions.toLocaleString()} in potential write-offs!
                </span>
              </div>
              <p className="text-sm text-emerald-700">
                These expenses exceed your AGI threshold and may be tax deductible.
              </p>
            </div>
          ) : (
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <p className="text-sm text-blue-700">
                Track ${(threshold - currentTracked).toLocaleString()} more in medical expenses to unlock potential deductions.
              </p>
            </div>
          )}

          {/* CTA Button */}
          <Button 
            onClick={() => navigate('/expenses')}
            className="w-full bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600"
          >
            See Details
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}