
import React from 'react';
import { Button } from '@/components/ui/button';

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
  return (
    <div className="mt-6 flex flex-col space-y-3">
      <Button onClick={handleNext} className="w-full">
        {!isFinalStep ? "Continue" : "Get Started"}
      </Button>
      
      {step > 1 && (
        <Button 
          variant="outline" 
          onClick={() => setStep(step - 1)} 
          className="w-full"
        >
          Back
        </Button>
      )}
      
      <Button 
        variant="ghost" 
        onClick={skipOnboarding} 
        className="w-full text-muted-foreground"
      >
        Skip for now
      </Button>
      
      <Button 
        variant="ghost" 
        onClick={resetOnboarding} 
        className="mt-1 text-sm text-gray-500"
      >
        Reset Onboarding
      </Button>
    </div>
  );
};

export default OnboardingControls;
