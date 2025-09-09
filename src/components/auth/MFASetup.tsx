import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Copy, CheckCircle, Loader2 } from 'lucide-react';

interface MFASetupProps {
  onComplete: () => void;
}

const MFASetup = ({ onComplete }: MFASetupProps) => {
  const [step, setStep] = useState<'generate' | 'verify'>('generate');
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [factorId, setFactorId] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [secretCopied, setSecretCopied] = useState(false);
  const { toast } = useToast();

  const generateMFASecret = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'Authenticator App'
      });

      if (error) throw error;

      setQrCode(data.totp.qr_code);
      setSecret(data.totp.secret);
      setFactorId(data.id);
      setStep('verify');
    } catch (error: any) {
      toast({
        title: "Setup Failed",
        description: error.message || "Failed to generate MFA secret",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyAndEnable = async () => {
    if (verificationCode.length !== 6) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.mfa.challengeAndVerify({
        factorId,
        code: verificationCode
      });

      if (error) throw error;

      toast({
        title: "MFA Enabled Successfully!",
        description: "Your account is now secured with two-factor authentication.",
      });
      
      // Force a refresh of auth context
      window.location.reload();
      onComplete();
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid verification code",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copySecret = async () => {
    await navigator.clipboard.writeText(secret);
    setSecretCopied(true);
    toast({
      title: "Secret Copied",
      description: "Secret key copied to clipboard",
    });
    setTimeout(() => setSecretCopied(false), 2000);
  };

  if (step === 'generate') {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Enable Two-Factor Authentication</CardTitle>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Two-factor authentication is required for all CountedCare accounts to keep your financial data secure.
          </p>
          <Button 
            onClick={generateMFASecret} 
            disabled={loading}
            className="w-full"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Set Up MFA
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle>Set Up Authenticator App</CardTitle>
        <CardDescription>
          Scan the QR code with your authenticator app
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="bg-white p-4 rounded-lg">
            <QRCodeSVG value={qrCode} size={200} />
          </div>
          
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Can't scan? Enter this code manually:
            </p>
            <div className="flex items-center space-x-2 bg-muted p-2 rounded text-sm font-mono">
              <span className="break-all">{secret}</span>
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
            onClick={verifyAndEnable}
            disabled={loading || verificationCode.length !== 6}
            className="w-full"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Verify & Enable MFA
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MFASetup;