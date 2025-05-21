
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/components/ui/use-toast';
import Logo from '@/components/Logo';
import useLocalStorage from '@/hooks/useLocalStorage';
import { User, RELATIONSHIP_TYPES } from '@/types/User';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [user, setUser] = useLocalStorage<User>('countedcare-user', {
    name: '',
    email: '',
    isCaregiver: true,
    caregivingFor: [],
    onboardingComplete: false
  });
  
  const [selectedRelationship, setSelectedRelationship] = useState<string>("");

  const handleNext = () => {
    if (step === 1 && (!user.name || !user.email)) {
      toast({
        title: "Missing Information",
        description: "Please enter your name and email to continue.",
        variant: "destructive",
      });
      return;
    }
    
    if (step === 2 && user.isCaregiver && selectedRelationship) {
      // Add the selected relationship to caregivingFor if it's not already there
      if (!user.caregivingFor?.includes(selectedRelationship)) {
        setUser({
          ...user,
          caregivingFor: [...(user.caregivingFor || []), selectedRelationship]
        });
      }
    }
    
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Complete onboarding
      setUser({ ...user, onboardingComplete: true });
      navigate('/dashboard');
    }
  };

  const resetOnboarding = () => {
    setUser({
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

  // Check if user has completed onboarding
  React.useEffect(() => {
    if (user.onboardingComplete) {
      navigate('/dashboard');
    }
  }, [user.onboardingComplete, navigate]);

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
            <div>
              <h2 className="text-xl font-heading mb-4">Getting Started</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Your Name</Label>
                  <Input 
                    id="name" 
                    placeholder="Enter your name" 
                    value={user.name} 
                    onChange={(e) => setUser({...user, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="Enter your email" 
                    value={user.email} 
                    onChange={(e) => setUser({...user, email: e.target.value})}
                  />
                </div>
              </div>
            </div>
          )}
          
          {step === 2 && (
            <div>
              <h2 className="text-xl font-heading mb-4">Your Caregiving Role</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Are you a caregiver?</Label>
                  <RadioGroup
                    value={user.isCaregiver ? "yes" : "no"}
                    onValueChange={(value) => setUser({...user, isCaregiver: value === "yes"})}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="yes" />
                      <Label htmlFor="yes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="no" />
                      <Label htmlFor="no">No</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                {user.isCaregiver && (
                  <div className="space-y-2">
                    <Label htmlFor="caregivingFor">Who are you caring for?</Label>
                    <Select 
                      value={selectedRelationship}
                      onValueChange={(value) => setSelectedRelationship(value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select relationship" />
                      </SelectTrigger>
                      <SelectContent>
                        {RELATIONSHIP_TYPES.map((relationship) => (
                          <SelectItem key={relationship} value={relationship}>
                            {relationship}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    {user.caregivingFor && user.caregivingFor.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">Selected relationships:</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {user.caregivingFor.map((relation, index) => (
                            <div key={index} className="bg-primary/10 text-primary px-2 py-1 rounded-md text-sm flex items-center">
                              {relation}
                              <button 
                                className="ml-2 hover:text-destructive"
                                onClick={() => setUser({
                                  ...user,
                                  caregivingFor: user.caregivingFor?.filter((r) => r !== relation)
                                })}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {step === 3 && (
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
            </div>
          )}
          
          <div className="mt-6 flex flex-col space-y-3">
            <Button onClick={handleNext} className="w-full">
              {step < 3 ? "Continue" : "Get Started"}
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
              onClick={resetOnboarding} 
              className="mt-4 text-sm text-gray-500"
            >
              Reset Onboarding
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="mt-4 text-sm text-gray-500">
        <p>© 2025 CountedCare. All rights reserved.</p>
      </div>
    </div>
  );
};

export default Index;
