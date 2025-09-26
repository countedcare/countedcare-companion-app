import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Shield, Zap, Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BetaPaymentWallProps {
  onPaymentSuccess?: () => void;
  freeTrialExpenses?: number;
  freeTrialLimit?: number;
}

const BetaPaymentWall: React.FC<BetaPaymentWallProps> = ({ 
  onPaymentSuccess, 
  freeTrialExpenses = 10,
  freeTrialLimit = 10 
}) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handlePayment = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to continue",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-beta-payment', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      if (data?.url) {
        // Open Stripe checkout in new tab
        window.open(data.url, '_blank');
        
        toast({
          title: "Redirecting to payment",
          description: "Complete your payment in the new tab, then refresh this page",
        });
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <div>
            <Badge variant="secondary" className="mb-2">
              Limited Beta Access
            </Badge>
            <CardTitle className="text-2xl">Join CountedCare Beta</CardTitle>
            <CardDescription>
              You've used {freeTrialExpenses} of {freeTrialLimit} free expenses. Upgrade to continue tracking medical expenses.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">$5</div>
            <div className="text-sm text-muted-foreground">One-time beta access fee</div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-green-500" />
              <span className="text-sm">Secure medical expense tracking</span>
            </div>
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-blue-500" />
              <span className="text-sm">AI-powered receipt processing</span>
            </div>
            <div className="flex items-center gap-3">
              <Heart className="w-5 h-5 text-red-500" />
              <span className="text-sm">Built specifically for caregivers</span>
            </div>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">What you get:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Full access to all beta features</li>
              <li>• Priority support from our team</li>
              <li>• Direct influence on product development</li>
              <li>• Early access to new features</li>
            </ul>
          </div>

          <Button 
            onClick={handlePayment}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? "Processing..." : "Get Beta Access - $5"}
          </Button>

          <div className="text-xs text-center text-muted-foreground">
            Secure payment powered by Stripe. Your support helps us build better tools for caregivers.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BetaPaymentWall;