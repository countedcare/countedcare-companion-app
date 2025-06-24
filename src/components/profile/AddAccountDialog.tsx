
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLinkedAccounts } from '@/hooks/useLinkedAccounts';
import { useToast } from '@/components/ui/use-toast';
import { ACCOUNT_TYPES } from '@/types/FinancialAccount';
import { Building2, Plus } from 'lucide-react';

interface AddAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddAccountDialog: React.FC<AddAccountDialogProps> = ({ open, onOpenChange }) => {
  const [accountName, setAccountName] = useState('');
  const [accountType, setAccountType] = useState('');
  const [institutionName, setInstitutionName] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { addAccount } = useLinkedAccounts();
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
    toast({
      title: "Feature Unavailable",
      description: "Bank account syncing requires authentication which has been disabled. Please add accounts manually.",
      variant: "destructive"
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Link Financial Account</DialogTitle>
          <DialogDescription>
            Add your financial accounts to track expenses manually
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
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

            <div className="border rounded-lg p-4 space-y-3 bg-gray-50">
              <div className="flex items-center space-x-2">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-medium text-muted-foreground">Auto-sync Disabled</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Automatic transaction syncing is currently disabled. You can add accounts manually to organize your expense tracking.
              </p>
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
