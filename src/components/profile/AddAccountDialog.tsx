
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLinkedAccounts } from '@/hooks/useLinkedAccounts';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ACCOUNT_TYPES } from '@/types/FinancialAccount';
import { CreditCard, Building2, Plus } from 'lucide-react';

interface AddAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddAccountDialog: React.FC<AddAccountDialogProps> = ({ open, onOpenChange }) => {
  const [accountName, setAccountName] = useState('');
  const [accountType, setAccountType] = useState('');
  const [institutionName, setInstitutionName] = useState('');
  const [loading, setLoading] = useState(false);
  const [connectingStripe, setConnectingStripe] = useState(false);
  
  const { addAccount } = useLinkedAccounts();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!accountName || !accountType) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      await addAccount({
        account_name: accountName,
        account_type: accountType as any,
        institution_name: institutionName || undefined,
        is_active: true
      });

      setAccountName('');
      setAccountType('');
      setInstitutionName('');
      onOpenChange(false);
    } catch (error) {
      console.error('Error adding account:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStripeConnect = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please sign in to connect your bank account",
        variant: "destructive"
      });
      return;
    }

    setConnectingStripe(true);
    try {
      // Create a Financial Connections session
      const { data: sessionData, error: sessionError } = await supabase.functions.invoke('stripe-financial-connections', {
        body: { action: 'create_session' }
      });

      if (sessionError) throw sessionError;

      // Open Stripe's hosted authorization flow
      const stripeWindow = window.open(
        sessionData.hosted_auth_url,
        'stripe-connect',
        'width=500,height=600'
      );

      // Listen for the completion
      const checkClosed = setInterval(() => {
        if (stripeWindow?.closed) {
          clearInterval(checkClosed);
          handleStripeConnectionComplete(sessionData.id);
        }
      }, 1000);

    } catch (error) {
      console.error('Error connecting with Stripe:', error);
      toast({
        title: "Error",
        description: "Failed to connect bank account",
        variant: "destructive"
      });
    } finally {
      setConnectingStripe(false);
    }
  };

  const handleStripeConnectionComplete = async (sessionId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('stripe-financial-connections', {
        body: {
          action: 'link_account',
          sessionId,
          accountName: accountName || 'Connected Bank Account'
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Bank account connected successfully!"
      });

      setAccountName('');
      setAccountType('');
      setInstitutionName('');
      onOpenChange(false);
    } catch (error) {
      console.error('Error completing connection:', error);
      toast({
        title: "Error",
        description: "Failed to complete bank connection",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Link Financial Account</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Stripe Connect Option */}
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5 text-primary" />
              <h3 className="font-medium">Connect Bank Account</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Securely connect your bank account to automatically import transactions
            </p>
            <Input
              placeholder="Account nickname (optional)"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
            />
            <Button 
              onClick={handleStripeConnect}
              disabled={connectingStripe}
              className="w-full"
            >
              {connectingStripe ? 'Connecting...' : 'Connect with Stripe'}
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or add manually</span>
            </div>
          </div>

          {/* Manual Entry Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="account-name">Account Name *</Label>
              <Input
                id="account-name"
                placeholder="e.g., Chase Checking"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="account-type">Account Type *</Label>
              <Select value={accountType} onValueChange={setAccountType} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select account type" />
                </SelectTrigger>
                <SelectContent>
                  {ACCOUNT_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="institution-name">Bank/Institution Name</Label>
              <Input
                id="institution-name"
                placeholder="e.g., Chase Bank"
                value={institutionName}
                onChange={(e) => setInstitutionName(e.target.value)}
              />
            </div>

            <div className="flex space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Adding...' : 'Add Account'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddAccountDialog;
