import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { CreditCard } from 'lucide-react';
import { useLinkedAccounts } from '@/hooks/useLinkedAccounts';
import { useToast } from '@/hooks/use-toast';
import { ACCOUNT_TYPES } from '@/types/FinancialAccount';

interface LinkFinancialAccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LinkFinancialAccountModal: React.FC<LinkFinancialAccountModalProps> = ({
  open,
  onOpenChange
}) => {
  const { addAccount } = useLinkedAccounts();
  const { toast } = useToast();
  
  const [isConnecting, setIsConnecting] = useState(false);
  const [manualForm, setManualForm] = useState({
    accountName: '',
    accountType: '',
    institutionName: ''
  });

  const handlePlaidConnect = async () => {
    setIsConnecting(true);
    
    // For now, simulate Plaid connection with a message
    toast({
      title: "Plaid Connection",
      description: "Use the full Plaid integration in the Profile page for complete functionality",
    });
    
    setTimeout(() => {
      setIsConnecting(false);
      onOpenChange(false);
    }, 1500);
  };

  const handleManualAdd = async () => {
    if (!manualForm.accountName || !manualForm.accountType) {
      toast({
        title: "Missing Information",
        description: "Please fill in account name and type",
        variant: "destructive"
      });
      return;
    }

    try {
      await addAccount({
        account_name: manualForm.accountName,
        account_type: manualForm.accountType as any,
        institution_name: manualForm.institutionName || undefined,
        is_active: true
      });
      
      toast({
        title: "Account Added",
        description: "Financial account added successfully",
      });
      
      setManualForm({ accountName: '', accountType: '', institutionName: '' });
      onOpenChange(false);
    } catch (error) {
      console.error('Error adding account:', error);
      toast({
        title: "Error",
        description: "Failed to add account. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Link Financial Account</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Connect your bank account to import and categorize transactions automatically.
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Plaid Connection Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-4 border rounded-lg">
              <CreditCard className="h-5 w-5 text-blue-600" />
              <div className="flex-1">
                <h3 className="font-medium">Connect Bank Account</h3>
                <p className="text-sm text-muted-foreground">
                  Use Plaid to securely connect your bank account.
                </p>
              </div>
            </div>

            {/* Sandbox Credentials */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm font-medium text-blue-900 mb-2">
                Sandbox credentials (for testing):
              </p>
              <p className="text-sm text-blue-800">
                <strong>Username:</strong> user_good • <strong>Password:</strong> pass_good
              </p>
            </div>

            <Button 
              onClick={handlePlaidConnect}
              disabled={isConnecting}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isConnecting ? 'Connecting...' : 'Connect with Plaid (Sandbox)'}
            </Button>
          </div>

          {/* Divider */}
          <div className="relative">
            <Separator />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-sm text-muted-foreground">
              OR ADD MANUALLY
            </div>
          </div>

          {/* Manual Form Section */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="accountName">
                Account Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="accountName"
                placeholder="e.g., Chase Checking"
                value={manualForm.accountName}
                onChange={(e) => setManualForm(prev => ({ ...prev, accountName: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountType">
                Account Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={manualForm.accountType}
                onValueChange={(value) => setManualForm(prev => ({ ...prev, accountType: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select account type" />
                </SelectTrigger>
                <SelectContent>
                  {ACCOUNT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="institutionName">Bank/Institution Name</Label>
              <Input
                id="institutionName"
                placeholder="e.g., Chase Bank"
                value={manualForm.institutionName}
                onChange={(e) => setManualForm(prev => ({ ...prev, institutionName: e.target.value }))}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleManualAdd}
              className="flex-1"
            >
              Add Account
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LinkFinancialAccountModal;