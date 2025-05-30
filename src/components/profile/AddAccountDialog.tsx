
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLinkedAccounts } from '@/hooks/useLinkedAccounts';
import { ACCOUNT_TYPES } from '@/types/FinancialAccount';

interface AddAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddAccountDialog = ({ open, onOpenChange }: AddAccountDialogProps) => {
  const { addAccount } = useLinkedAccounts();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    account_type: '',
    account_name: '',
    institution_name: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.account_type || !formData.account_name) return;

    setLoading(true);
    try {
      await addAccount({
        account_type: formData.account_type as any,
        account_name: formData.account_name,
        institution_name: formData.institution_name || undefined,
        is_active: true
      });
      
      setFormData({ account_type: '', account_name: '', institution_name: '' });
      onOpenChange(false);
    } catch (error) {
      // Error handled in hook
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Link Financial Account</DialogTitle>
          <DialogDescription>
            Add a bank account, HSA, or FSA to automatically track qualifying medical expenses.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="account_type">Account Type*</Label>
            <Select 
              value={formData.account_type} 
              onValueChange={(value) => handleInputChange('account_type', value)}
              required
            >
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
            <Label htmlFor="account_name">Account Name*</Label>
            <Input
              id="account_name"
              placeholder="e.g., Main Checking, HSA Account"
              value={formData.account_name}
              onChange={(e) => handleInputChange('account_name', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="institution_name">Institution Name</Label>
            <Input
              id="institution_name"
              placeholder="e.g., Chase, Bank of America"
              value={formData.institution_name}
              onChange={(e) => handleInputChange('institution_name', e.target.value)}
            />
          </div>

          <div className="bg-blue-50 p-3 rounded-md">
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> Full bank integration with automatic transaction sync will be available soon. 
              For now, you can manually add accounts and we'll prepare your data for future automation.
            </p>
          </div>

          <div className="flex space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="w-full"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !formData.account_type || !formData.account_name}
              className="w-full"
            >
              {loading ? 'Adding...' : 'Link Account'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddAccountDialog;
