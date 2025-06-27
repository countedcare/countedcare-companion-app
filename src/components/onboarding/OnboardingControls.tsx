
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface OnboardingControlsProps {
  step: number;
  handleNext: () => void;
  setStep: (step: number) => void;
  isFinalStep: boolean;
}

const OnboardingControls: React.FC<OnboardingControlsProps> = ({ 
  step, 
  handleNext, 
  setStep, 
  isFinalStep
}) => {
  const getNextButtonText = () => {
    if (step === 0) return "Get Started";
    if (isFinalStep) return "Enter CountedCare";
    return "Continue";
  };

  return (
    <div className="mt-8 space-y-3">
      <Button onClick={handleNext} className="w-full h-12 text-base font-medium">
        {getNextButtonText()}
        {!isFinalStep && <ArrowRight className="ml-2 h-4 w-4" />}
      </Button>
      
      {step > 0 && (
        <Button 
          variant="outline" 
          onClick={() => setStep(step - 1)} 
          className="w-full"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      )}
    </div>
  );
};

export default OnboardingControls;
