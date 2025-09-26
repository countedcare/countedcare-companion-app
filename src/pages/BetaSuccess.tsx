import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const BetaSuccess: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    toast({
      title: "Welcome to CountedCare Beta!",
      description: "Your payment was successful. You now have full access to all beta features.",
    });
  }, [toast]);

  const handleContinue = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <div>
            <CardTitle className="text-2xl text-green-600">Payment Successful!</CardTitle>
            <CardDescription>
              Welcome to CountedCare Beta. You're all set to start tracking your medical expenses.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2">You now have access to:</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• All beta features and tools</li>
              <li>• AI-powered receipt processing</li>
              <li>• Advanced expense tracking</li>
              <li>• Priority customer support</li>
            </ul>
          </div>

          <Button 
            onClick={handleContinue}
            className="w-full"
            size="lg"
          >
            Start Using CountedCare
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>

          <div className="text-xs text-center text-muted-foreground">
            Thank you for supporting CountedCare in beta. Your feedback helps us build better tools for caregivers.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BetaSuccess;