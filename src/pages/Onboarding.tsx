
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import Logo from '@/components/Logo';
import useLocalStorage from '@/hooks/useLocalStorage';
import { User } from '@/types/User';
import OnboardingProgress from '@/components/onboarding/OnboardingProgress';
import WelcomeStep from '@/components/onboarding/WelcomeStep';
import UserInfoStep from '@/components/onboarding/UserInfoStep';
import CaregiverRoleStep from '@/components/onboarding/CaregiverRoleStep';
import TrackingGoalsStep from '@/components/onboarding/TrackingGoalsStep';
import CompletionStep from '@/components/onboarding/CompletionStep';
import OnboardingControls from '@/components/onboarding/OnboardingControls';

const Onboarding = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [step, setStep] = useState(0);
  const [localUser, setLocalUser] = useLocalStorage<User>('countedcare-user', {
    name: '',
    email: '',
    isCaregiver: true,
    caregivingFor: [],
    onboardingComplete: false,
    zipCode: '',
    householdAGI: undefined
  });
  
  const [selectedRelationship, setSelectedRelationship] = useState<string>("");
  const totalSteps = 5;

  // Check authentication and onboarding status
  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      // User is not authenticated, redirect to auth
      navigate('/auth');
      return;
    }
    
    // User is authenticated, check if they completed onboarding
    if (localUser.onboardingComplete) {
      navigate('/dashboard');
    }
  }, [user, authLoading, localUser.onboardingComplete, navigate]);

  const handleNext = () => {
    // Validate step 1 (User Info)
    if (step === 1 && (!localUser.name || !localUser.email)) {
      toast({
        title: "Please complete your information",
        description: "Your name and email are required to continue.",
        variant: "destructive",
      });
      return;
    }
    
    if (step === 2) {
      const updatedUser = {
        ...localUser,
        caregiverRole: localUser.caregiverRole || [],
        householdAGI: localUser.householdAGI,
        state: localUser.state,
        zipCode: localUser.zipCode,
        county: localUser.county,
        employmentStatus: localUser.employmentStatus,
        taxFilingStatus: localUser.taxFilingStatus,
        numberOfDependents: localUser.numberOfDependents,
        caregivingFor: localUser.caregivingFor || []
      };
      
      if (selectedRelationship && !updatedUser.caregivingFor.includes(selectedRelationship)) {
        updatedUser.caregivingFor = [...updatedUser.caregivingFor, selectedRelationship];
      }
      
      setLocalUser(updatedUser);
      setSelectedRelationship("");
    }
    
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      const finalUser = {
        ...localUser,
        onboardingComplete: true,
        state: localUser.state,
        county: localUser.county,
        zipCode: localUser.zipCode,
        householdAGI: localUser.householdAGI,
        caregiverRole: localUser.caregiverRole,
        numberOfDependents: localUser.numberOfDependents,
        employmentStatus: localUser.employmentStatus,
        taxFilingStatus: localUser.taxFilingStatus,
        healthCoverageType: localUser.healthCoverageType,
        primaryCaregivingExpenses: localUser.primaryCaregivingExpenses,
        preferredNotificationMethod: localUser.preferredNotificationMethod
      };
      
      setLocalUser(finalUser);
      
      toast({
        title: "Welcome to CountedCare! 🎉",
        description: "Your profile is set up and ready to help you track expenses and find resources.",
      });
      navigate('/dashboard');
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 0:
        return <WelcomeStep />;
      case 1:
        return <UserInfoStep user={localUser} setUser={setLocalUser} />;
      case 2:
        return (
          <CaregiverRoleStep 
            user={localUser} 
            setUser={setLocalUser}
            selectedRelationship={selectedRelationship}
            setSelectedRelationship={setSelectedRelationship}
          />
        );
      case 3:
        return <TrackingGoalsStep user={localUser} setUser={setLocalUser} />;
      case 4:
        return <CompletionStep userName={localUser.name} />;
      default:
        return <WelcomeStep />;
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 0: return "Welcome";
      case 1: return "Your Information";
      case 2: return "Caregiver Details";
      case 3: return "Tracking Goals";
      case 4: return "All Set!";
      default: return "Setup";
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-neutral">
      <div className="w-full max-w-md mb-8 text-center">
        <Logo size="lg" className="justify-center mb-4" />
        {step > 0 && (
          <div className="mb-4">
            <h1 className="text-xl font-heading font-semibold text-gray-800 mb-2">
              {getStepTitle()}
            </h1>
            <OnboardingProgress currentStep={step} totalSteps={totalSteps - 1} />
          </div>
        )}
      </div>
      
      <Card className="w-full max-w-md animate-fade-in">
        <CardContent className="pt-6">
          {renderStepContent()}
          
          <OnboardingControls
            step={step}
            handleNext={handleNext}
            setStep={setStep}
            isFinalStep={step === totalSteps - 1}
          />
        </CardContent>
      </Card>

      
      <div className="mt-4 text-sm text-gray-500">
        <p>© 2025 CountedCare. Your caregiving companion.</p>
      </div>
    </div>
  );
};

export default Onboarding;
