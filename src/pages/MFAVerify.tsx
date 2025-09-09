import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import AuthHeader from '@/components/auth/AuthHeader';

const MFAVerify = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const [factors, setFactors] = useState<any[]>([]);
  const [selectedFactorId, setSelectedFactorId] = useState<string>('');
  const [challengeData, setChallengeData] = useState<any>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const loadFactors = async () => {
      try {
        const { data, error } = await supabase.auth.mfa.listFactors();
        if (error) throw error;

        const enrolledFactors = data?.totp?.filter(factor => factor.status === 'verified') || [];
        setFactors(enrolledFactors);
        
        if (enrolledFactors.length > 0) {
          const defaultFactor = enrolledFactors[0];
          setSelectedFactorId(defaultFactor.id);
          
          // Issue challenge for the default factor
          const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
            factorId: defaultFactor.id
          });
          
          if (challengeError) throw challengeError;
          setChallengeData(challenge);
        }
      } catch (error: any) {
        console.error('Error loading factors:', error);
        toast({
          title: "Error Loading MFA",
          description: error.message || "Failed to load MFA factors",
          variant: "destructive",
        });
      } finally {
        setInitializing(false);
      }
    };

    loadFactors();
  }, [toast]);

  const handleFactorChange = async (factorId: string) => {
    setSelectedFactorId(factorId);
    setVerificationCode('');
    
    // Issue new challenge for selected factor
    try {
      const { data: challenge, error } = await supabase.auth.mfa.challenge({
        factorId
      });
      
      if (error) throw error;
      setChallengeData(challenge);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to issue challenge",
        variant: "destructive",
      });
    }
  };

  const handleVerify = async () => {
    if (verificationCode.length !== 6 || !selectedFactorId || !challengeData?.id) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.mfa.verify({
        factorId: selectedFactorId,
        challengeId: challengeData.id,
        code: verificationCode
      });

      if (error) throw error;

      toast({
        title: "Verification Successful",
        description: "You have been signed in successfully.",
      });

      // Re-check AAL level and navigate
      try {
        await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      } catch (error) {
        console.error('Error checking AAL:', error);
      }

      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid verification code. Please try again.",
        variant: "destructive",
      });
      setVerificationCode('');
    } finally {
      setLoading(false);
    }
  };

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-neutral">
      <AuthHeader />
      
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription>
            Enter the verification code from your authenticator app
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {factors.length > 1 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Choose Authenticator</label>
              <Select value={selectedFactorId} onValueChange={handleFactorChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an authenticator" />
                </SelectTrigger>
                <SelectContent>
                  {factors.map((factor) => (
                    <SelectItem key={factor.id} value={factor.id}>
                      {factor.friendly_name || 'Authenticator App'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Enter the 6-digit code:
              </p>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={verificationCode}
                  onChange={setVerificationCode}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>

            <Button 
              onClick={handleVerify}
              disabled={loading || verificationCode.length !== 6}
              className="w-full"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Verify Code
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

export default MFAVerify;