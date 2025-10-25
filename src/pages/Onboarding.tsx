
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import Logo from '@/components/Logo';
import { useSupabaseProfile } from '@/hooks/useSupabaseProfile';
import { supabase } from '@/integrations/supabase/client';
import OnboardingProgress from '@/components/onboarding/OnboardingProgress';
import WelcomeStep from '@/components/onboarding/WelcomeStep';
import UserInfoStep from '@/components/onboarding/UserInfoStep';
import CareRecipientsStep from '@/components/onboarding/CareRecipientsStep';
import TrackingGoalsStep from '@/components/onboarding/TrackingGoalsStep';
import CompletionStep from '@/components/onboarding/CompletionStep';
import OnboardingControls from '@/components/onboarding/OnboardingControls';

const Onboarding = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [step, setStep] = useState(0);
  const { profile, updateProfile, createProfile, loading: profileLoading } = useSupabaseProfile();
  const [tempProfileData, setTempProfileData] = useState({
    name: '',
    email: '',
    zipCode: '',
    householdAGI: undefined as number | undefined
  });
  
  const [careRecipients, setCareRecipients] = useState<Array<{
    name: string;
    relationship: string;
    tempId: string;
  }>>([]);
  
  const totalSteps = 5;

  // Check authentication and onboarding status
  useEffect(() => {
    if (authLoading || profileLoading) return;
    
    if (!user) {
      // User is not authenticated, redirect to auth
      navigate('/auth');
      return;
    }
    
    // User is authenticated, check if they completed onboarding
    if (profile?.onboarding_complete) {
      navigate('/home', { replace: true });
    }
  }, [user, authLoading, profile, profileLoading, navigate]);

  const handleNext = async () => {
    // Validate step 1 (User Info) - check profile data
    if (step === 1) {
      const hasName = tempProfileData.name || user?.user_metadata?.name || user?.user_metadata?.full_name;
      const hasEmail = tempProfileData.email || user?.email;
      
      if (!hasName || !hasEmail) {
        toast({
          title: "Please complete your information",
          description: "Your name and email are required to continue.",
          variant: "destructive",
        });
        return;
      }
    }
    
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      try {
        // Map camelCase UI fields to snake_case database fields
        const dbData = {
          name: tempProfileData.name || user?.user_metadata?.name || user?.user_metadata?.full_name,
          email: tempProfileData.email || user?.email,
          is_caregiver: careRecipients.length > 0, // Set based on whether they added care recipients
          caregiving_for: careRecipients.map(r => `${r.name} (${r.relationship})`),
          zip_code: tempProfileData.zipCode,
          household_agi: tempProfileData.householdAGI,
          onboarding_complete: true
        };
        
        // Create or update profile depending on whether it exists
        if (profile) {
          await updateProfile(dbData);
        } else {
          await createProfile(dbData as any);
        }
        
        // Save care recipients to the care_recipients table
        if (careRecipients.length > 0) {
          const careRecipientInserts = careRecipients.map(recipient => ({
            user_id: user?.id,
            name: recipient.name,
            relationship: recipient.relationship
          }));
          
          const { error: careRecipientsError } = await supabase
            .from('care_recipients')
            .insert(careRecipientInserts);
          
          if (careRecipientsError) {
            console.error('Error saving care recipients:', careRecipientsError);
            throw careRecipientsError;
          }
        }
        
        toast({
          title: "Welcome to CountedCare! 🎉",
          description: "Your profile is set up and ready to help you track expenses and find resources.",
        });
        navigate('/home');
      } catch (error) {
        console.error('Onboarding error:', error);
        toast({
          title: "Error",
          description: "Failed to complete onboarding. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 0:
        return <WelcomeStep />;
      case 1:
        return <UserInfoStep user={tempProfileData as any} setUser={setTempProfileData as any} />;
      case 2:
        return (
          <CareRecipientsStep 
            careRecipients={careRecipients}
            setCareRecipients={setCareRecipients}
            householdAGI={tempProfileData.householdAGI}
            setHouseholdAGI={(agi) => setTempProfileData({...tempProfileData, householdAGI: agi})}
          />
        );
      case 3:
        return <TrackingGoalsStep user={tempProfileData as any} setUser={setTempProfileData as any} />;
      case 4:
        return <CompletionStep userName={tempProfileData.name || user?.user_metadata?.name || user?.user_metadata?.full_name || 'there'} />;
      default:
        return <WelcomeStep />;
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 0: return "Welcome";
      case 1: return "Your Information";
      case 2: return "Care Recipients";
      case 3: return "Tracking Goals";
      case 4: return "All Set!";
      default: return "Setup";
    }
  };

  if (authLoading || profileLoading) {
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
