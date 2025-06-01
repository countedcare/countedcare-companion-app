
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import Logo from '@/components/Logo';
import useLocalStorage from '@/hooks/useLocalStorage';
import { User } from '@/types/User';
import UserInfoStep from '@/components/onboarding/UserInfoStep';
import CaregiverRoleStep from '@/components/onboarding/CaregiverRoleStep';
import TrackingGoalsStep from '@/components/onboarding/TrackingGoalsStep';
import OnboardingControls from '@/components/onboarding/OnboardingControls';

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const [step, setStep] = useState(1);
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

  // If loading, show nothing (auth context will handle loading state)
  if (loading) {
    return null;
  }

  // If user is authenticated, redirect to dashboard
  if (user) {
    navigate('/dashboard');
    return null;
  }

  const handleNext = () => {
    if (step === 1 && (!localUser.name || !localUser.email)) {
      toast({
        title: "Missing Information",
        description: "Please enter your name and email to continue.",
        variant: "destructive",
      });
      return;
    }
    
    if (step === 2 && localUser.isCaregiver && selectedRelationship) {
      // Add the selected relationship to caregivingFor if it's not already there
      if (!localUser.caregivingFor?.includes(selectedRelationship)) {
        setLocalUser({
          ...localUser,
          caregivingFor: [...(localUser.caregivingFor || []), selectedRelationship]
        });
      }
      setSelectedRelationship("");
    }
    
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Complete onboarding and redirect to auth
      setLocalUser({ ...localUser, onboardingComplete: true });
      navigate('/auth');
    }
  };

  const skipOnboarding = () => {
    // Set minimum required fields and redirect to auth
    setLocalUser({
      name: localUser.name || 'Anonymous User',
      email: localUser.email || '',
      isCaregiver: localUser.isCaregiver,
      caregivingFor: localUser.caregivingFor || [],
      onboardingComplete: true
    });
    
    toast({
      title: "Onboarding Skipped",
      description: "You can always update your information in your profile."
    });
    
    navigate('/auth');
  };

  const resetOnboarding = () => {
    setLocalUser({
      name: '',
      email: '',
      isCaregiver: true,
      onboardingComplete: false
    });
    setStep(1);
    toast({
      title: "Onboarding Reset",
      description: "Your onboarding information has been reset."
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-neutral">
      <div className="w-full max-w-md mb-8 text-center">
        <Logo size="lg" className="justify-center mb-4" />
        <h1 className="text-2xl font-heading font-semibold text-gray-800 mb-2">
          Track Your Caregiving Expenses
        </h1>
        <p className="text-gray-600">
          Maximize tax benefits while caring for your loved ones
        </p>
      </div>
      
      <Card className="w-full max-w-md animate-fade-in">
        <CardContent className="pt-6">
          {step === 1 && (
            <UserInfoStep user={localUser} setUser={setLocalUser} />
          )}
          
          {step === 2 && (
            <CaregiverRoleStep 
              user={localUser} 
              setUser={setLocalUser}
              selectedRelationship={selectedRelationship}
              setSelectedRelationship={setSelectedRelationship}
            />
          )}
          
          {step === 3 && (
            <TrackingGoalsStep />
          )}
          
          <OnboardingControls
            step={step}
            handleNext={handleNext}
            setStep={setStep}
            skipOnboarding={skipOnboarding}
            resetOnboarding={resetOnboarding}
            isFinalStep={step === 3}
          />
        </CardContent>
      </Card>

      <div className="mt-4 w-full max-w-md">
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => navigate('/auth')}
        >
          Already have an account? Sign In
        </Button>
      </div>
      
      <div className="mt-4 text-sm text-gray-500">
        <p>© 2025 CountedCare. All rights reserved.</p>
      </div>
    </div>
  );
};

export default Index;
