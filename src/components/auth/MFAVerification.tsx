import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface MFAVerificationProps {
  challengeId: string;
  onSuccess: () => void;
  onBack?: () => void;
}

const MFAVerification = ({ challengeId, onSuccess, onBack }: MFAVerificationProps) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const verifyMFA = async () => {
    if (verificationCode.length !== 6) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.mfa.verify({
        factorId: challengeId,
        challengeId,
        code: verificationCode
      });

      if (error) throw error;

      toast({
        title: "Verification Successful",
        description: "You have been signed in successfully.",
      });
      
      onSuccess();
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

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle>Two-Factor Authentication</CardTitle>
        <CardDescription>
          Enter the 6-digit code from your authenticator app
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
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

          <Button 
            onClick={verifyMFA}
            disabled={loading || verificationCode.length !== 6}
            className="w-full"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Verify Code
          </Button>

          {onBack && (
            <Button 
              variant="outline"
              onClick={onBack}
              className="w-full"
            >
              Back to Sign In
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MFAVerification;