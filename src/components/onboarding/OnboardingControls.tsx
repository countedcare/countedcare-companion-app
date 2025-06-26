
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Skip } from 'lucide-react';

interface OnboardingControlsProps {
  step: number;
  handleNext: () => void;
  setStep: (step: number) => void;
  skipOnboarding: () => void;
  resetOnboarding: () => void;
  isFinalStep: boolean;
}

const OnboardingControls: React.FC<OnboardingControlsProps> = ({ 
  step, 
  handleNext, 
  setStep, 
  skipOnboarding, 
  resetOnboarding,
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
      
      <div className="flex space-x-2">
        {step > 0 && (
          <Button 
            variant="outline" 
            onClick={() => setStep(step - 1)} 
            className="flex-1"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        )}
        
        {step > 0 && !isFinalStep && (
          <Button 
            variant="ghost" 
            onClick={skipOnboarding} 
            className="flex-1 text-gray-600"
          >
            <Skip className="mr-2 h-4 w-4" />
            Skip Setup
          </Button>
        )}
      </div>
      
      {step === 0 && (
        <Button 
          variant="ghost" 
          onClick={skipOnboarding} 
          className="w-full text-gray-500 text-sm"
        >
          Skip and explore the app
        </Button>
      )}
      
      {step > 0 && (
        <Button 
          variant="ghost" 
          onClick={resetOnboarding} 
          className="w-full mt-2 text-xs text-gray-400 hover:text-gray-600"
        >
          Start over
        </Button>
      )}
    </div>
  );
};

export default OnboardingControls;
