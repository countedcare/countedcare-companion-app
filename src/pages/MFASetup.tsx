import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Copy, CheckCircle, Loader2 } from 'lucide-react';
import AuthHeader from '@/components/auth/AuthHeader';

const MFASetup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const [enrollData, setEnrollData] = useState<any>(null);
  const [challengeData, setChallengeData] = useState<any>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [secretCopied, setSecretCopied] = useState(false);

  useEffect(() => {
    const initializeMFA = async () => {
      setLoading(true);
      try {
        // Check if factors already exist
        const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors();
        if (factorsError) throw factorsError;

        let enrollResult;
        if (!factors?.totp?.length) {
          // Enroll a new factor
          const { data, error } = await supabase.auth.mfa.enroll({
            factorType: 'totp',
            friendlyName: 'Authenticator App'
          });
          
          if (error) throw error;
          enrollResult = data;
        } else {
          // Use existing factor
          enrollResult = factors.totp[0];
        }

        setEnrollData(enrollResult);

        // Issue a challenge
        if (enrollResult?.id) {
          const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
            factorId: enrollResult.id
          });
          
          if (challengeError) throw challengeError;
          setChallengeData(challenge);
        }
      } catch (error: any) {
        console.error('Error initializing MFA:', error);
        toast({
          title: "Setup Failed",
          description: error.message || "Failed to initialize MFA setup",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    initializeMFA();
  }, [toast]);

  const handleVerify = async () => {
    if (verificationCode.length !== 6 || !enrollData?.id || !challengeData?.id) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.mfa.verify({
        factorId: enrollData.id,
        challengeId: challengeData.id,
        code: verificationCode
      });

      if (error) throw error;

      toast({
        title: "MFA Enabled Successfully!",
        description: "Your account is now secured with two-factor authentication.",
      });

      // Navigate back to original destination or home
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid verification code",
        variant: "destructive",
      });
      setVerificationCode('');
    } finally {
      setLoading(false);
    }
  };

  const copySecret = async () => {
    if (enrollData?.totp?.secret) {
      await navigator.clipboard.writeText(enrollData.totp.secret);
      setSecretCopied(true);
      toast({
        title: "Secret Copied",
        description: "Secret key copied to clipboard",
      });
      setTimeout(() => setSecretCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-neutral">
      <AuthHeader />
      
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Set Up Two-Factor Authentication</CardTitle>
          <CardDescription>
            Scan the QR code with your authenticator app
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {loading && !enrollData ? (
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Setting up MFA...</p>
            </div>
          ) : (
            <>
              <div className="flex flex-col items-center space-y-4">
                {enrollData?.totp?.qr_code && (
                  <div className="bg-white p-4 rounded-lg">
                    <QRCodeSVG value={enrollData.totp.qr_code} size={200} />
                  </div>
                )}
                
                {enrollData?.totp?.secret && (
                  <div className="text-center space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Can't scan? Enter this code manually:
                    </p>
                    <div className="flex items-center space-x-2 bg-muted p-2 rounded text-sm font-mono">
                      <span className="break-all">{enrollData.totp.secret}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={copySecret}
                        className="shrink-0"
                      >
                        {secretCopied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    Enter the 6-digit code from your authenticator app:
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
                  Verify & Enable MFA
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="mt-4 text-sm text-gray-500">
        <p>© 2025 CountedCare. All rights reserved.</p>
      </div>
    </div>
  );
};

export default MFASetup;