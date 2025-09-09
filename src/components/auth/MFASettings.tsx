import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Shield, ShieldCheck, Trash2, Plus, Loader2 } from 'lucide-react';
import MFASetup from './MFASetup';

const MFASettings = () => {
  const [factors, setFactors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showSetup, setShowSetup] = useState(false);
  const { toast } = useToast();

  const loadFactors = async () => {
    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      
      if (error) throw error;
      
      setFactors(data?.totp || []);
    } catch (error: any) {
      console.error('Error loading MFA factors:', error);
      toast({
        title: "Error Loading MFA Settings",
        description: error.message || "Failed to load MFA settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const unenrollFactor = async (factorId: string) => {
    setDeleting(factorId);
    try {
      const { error } = await supabase.auth.mfa.unenroll({ factorId });
      
      if (error) throw error;
      
      toast({
        title: "MFA Disabled",
        description: "Two-factor authentication has been disabled for your account.",
      });
      
      await loadFactors();
    } catch (error: any) {
      toast({
        title: "Error Disabling MFA",
        description: error.message || "Failed to disable MFA",
        variant: "destructive",
      });
    } finally {
      setDeleting(null);
    }
  };

  const handleSetupComplete = () => {
    setShowSetup(false);
    loadFactors();
    toast({
      title: "MFA Enabled Successfully!",
      description: "Your account is now protected with two-factor authentication.",
    });
  };

  useEffect(() => {
    loadFactors();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Loading MFA settings...</p>
        </CardContent>
      </Card>
    );
  }

  const hasMFA = factors.length > 0;

  return (
    <Card>
      <CardHeader className="mobile-card-padding">
        <CardTitle className="mobile-text flex items-center gap-2">
          {hasMFA ? <ShieldCheck className="h-5 w-5 text-green-600" /> : <Shield className="h-5 w-5" />}
          Two-Factor Authentication
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Add an extra layer of security to your account
        </CardDescription>
      </CardHeader>
      <CardContent className="mobile-card-padding pt-0">
        {hasMFA ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Enabled
              </Badge>
              <span className="text-sm text-muted-foreground">
                Your account is protected with 2FA
              </span>
            </div>
            
            <div className="space-y-3">
              {factors.map((factor) => (
                <div 
                  key={factor.id} 
                  className="flex items-center justify-between border rounded-md p-3"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">
                      {factor.friendly_name || 'Authenticator App'}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Status: {factor.status}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => unenrollFactor(factor.id)}
                    disabled={deleting === factor.id}
                    className="text-destructive hover:text-destructive"
                  >
                    {deleting === factor.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-red-100 text-red-800">
                Required
              </Badge>
              <span className="text-sm text-muted-foreground">
                MFA is required for all accounts
              </span>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Two-factor authentication is required for all CountedCare accounts to protect your sensitive financial data.
            </p>
            
            <Dialog open={showSetup} onOpenChange={setShowSetup}>
              <DialogTrigger asChild>
                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Enable Two-Factor Authentication
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Enable Two-Factor Authentication</DialogTitle>
                  <DialogDescription>
                    Follow the steps below to set up 2FA for your account.
                  </DialogDescription>
                </DialogHeader>
                <MFASetup 
                  onComplete={handleSetupComplete}
                />
              </DialogContent>
            </Dialog>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MFASettings;