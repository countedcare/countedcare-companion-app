import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLinkedAccounts } from '@/hooks/useLinkedAccounts';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ACCOUNT_TYPES } from '@/types/FinancialAccount';
import { Building2, Plus, CreditCard } from 'lucide-react';

interface AddAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddAccountDialog: React.FC<AddAccountDialogProps> = ({ open, onOpenChange }) => {
  const [accountName, setAccountName] = useState('');
  const [accountType, setAccountType] = useState('');
  const [institutionName, setInstitutionName] = useState('');
  const [loading, setLoading] = useState(false);
  const [plaidLoading, setPlaidLoading] = useState(false);
  
  const { addAccount } = useLinkedAccounts();
  const { toast } = useToast();
  const { user } = useAuth();

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

  const initializePlaidHandler = (linkToken: string) => {
    try {
      console.log('Creating Plaid handler with token');
      const handler = (window as any).Plaid.create({
        token: linkToken,
        onSuccess: async (public_token: string, metadata: any) => {
          console.log('Plaid onSuccess triggered:', { public_token, metadata });
          try {
            toast({
              title: "Processing Connection",
              description: "Exchanging tokens..."
            });

            // Exchange public token for access token
            const { data: exchangeData, error: exchangeError } = await supabase.functions.invoke('plaid-financial-connections', {
              body: {
                action: 'exchange_public_token',
                public_token: public_token,
                account_name: metadata.institution?.name || 'Connected Account'
              }
            });

            if (exchangeError) {
              throw new Error(exchangeError.message);
            }

            toast({
              title: "Bank Connected",
              description: "Your bank account has been connected successfully"
            });
            onOpenChange(false);
            // Refresh the accounts list
            window.location.reload();
          } catch (error) {
            console.error('Error exchanging token:', error);
            toast({
              title: "Connection Error",
              description: "Failed to complete bank connection",
              variant: "destructive"
            });
          }
        },
        onExit: (err: any, metadata: any) => {
          console.log('Plaid onExit triggered:', { err, metadata });
          if (err) {
            console.error('Plaid Link exit error:', err);
            toast({
              title: "Connection Cancelled",
              description: "Bank connection was cancelled or failed",
              variant: "destructive"
            });
          }
        },
        onEvent: (eventName: string, metadata: any) => {
          console.log('Plaid event:', eventName, metadata);
        }
      });
      
      console.log('Opening Plaid handler');
      handler.open();
    } catch (error) {
      console.error('Error creating Plaid handler:', error);
      toast({
        title: "Error",
        description: "Failed to initialize bank connection",
        variant: "destructive"
      });
    }
  };

  const handlePlaidConnect = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to connect bank accounts",
        variant: "destructive"
      });
      return;
    }

    setPlaidLoading(true);
    try {
      console.log('Creating Plaid link token...');
      
      // First, get the link token from our backend
      const { data, error } = await supabase.functions.invoke('plaid-financial-connections', {
        body: {
          action: 'create_link_token',
          user_id: user.id
        }
      });

      if (error) {
        console.error('Error creating Plaid link token:', error);
        toast({
          title: "Error",
          description: "Failed to initialize bank connection",
          variant: "destructive"
        });
        return;
      }

      if (data?.link_token) {
        console.log('Link token received:', data.link_token);
        
        // Check if Plaid is already loaded
        if ((window as any).Plaid) {
          console.log('Plaid already loaded, creating handler');
          initializePlaidHandler(data.link_token);
        } else {
          console.log('Loading Plaid script');
          // Load Plaid Link dynamically
          const script = document.createElement('script');
          script.src = 'https://cdn.plaid.com/link/v2/stable/link-initialize.js';
          script.onload = () => {
            console.log('Plaid script loaded successfully');
            initializePlaidHandler(data.link_token);
          };
          script.onerror = (error) => {
            console.error('Failed to load Plaid script:', error);
            toast({
              title: "Error",
              description: "Failed to load bank connection service",
              variant: "destructive"
            });
          };
          document.head.appendChild(script);
        }
      }
    } catch (error) {
      console.error('Error connecting to Plaid:', error);
      toast({
        title: "Error",
        description: "Failed to connect to bank account service",
        variant: "destructive"
      });
    } finally {
      setPlaidLoading(false);
    }
  };

  // Effect to clean up any existing Plaid scripts
  useEffect(() => {
    return () => {
      // Cleanup: remove any existing Plaid scripts when component unmounts
      const existingScripts = document.querySelectorAll('script[src*="plaid.com"]');
      existingScripts.forEach(script => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      });
    };
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Link Financial Account</DialogTitle>
          <DialogDescription>
            Connect your bank accounts to automatically track expenses
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Plaid Connect Option */}
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5 text-primary" />
              <h3 className="font-medium">Connect Bank Account</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Securely connect your bank account to automatically import and categorize transactions.
            </p>
            <Button 
              onClick={handlePlaidConnect} 
              disabled={plaidLoading}
              className="w-full"
            >
              {plaidLoading ? 'Connecting...' : 'Connect with Plaid'}
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or add manually
              </span>
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