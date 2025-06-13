
import React from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, CAREGIVER_ROLES, EMPLOYMENT_STATUS_OPTIONS, TAX_FILING_STATUS_OPTIONS } from '@/types/User';

interface CaregiverRoleStepProps {
  user: User;
  setUser: (user: User) => void;
  selectedRelationship: string;
  setSelectedRelationship: (relationship: string) => void;
}

const CaregiverRoleStep: React.FC<CaregiverRoleStepProps> = ({ 
  user, 
  setUser, 
  selectedRelationship, 
  setSelectedRelationship 
}) => {
  
  const updateArrayField = (field: keyof User, value: string, checked: boolean) => {
    const currentArray = (user[field] as string[]) || [];
    if (checked) {
      setUser({ ...user, [field]: [...currentArray, value] });
    } else {
      setUser({ ...user, [field]: currentArray.filter(item => item !== value) });
    }
  };

  return (
    <div>
      <h2 className="text-xl font-heading mb-4">Your Caregiving Role</h2>
      <div className="space-y-6">
        <div className="space-y-2">
          <Label>Are you a caregiver?</Label>
          <RadioGroup
            value={user.isCaregiver ? "yes" : "no"}
            onValueChange={(value) => setUser({...user, isCaregiver: value === "yes"})}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="yes" />
              <Label htmlFor="yes">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="no" />
              <Label htmlFor="no">No</Label>
            </div>
          </RadioGroup>
        </div>
        
        {user.isCaregiver && (
          <>
            <div className="space-y-2">
              <Label>Your caregiving role (select all that apply)</Label>
              <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                {CAREGIVER_ROLES.map(role => (
                  <div key={role} className="flex items-center space-x-2">
                    <Checkbox
                      id={role}
                      checked={(user.caregiverRole || []).includes(role)}
                      onCheckedChange={(checked) => updateArrayField('caregiverRole', role, checked as boolean)}
                    />
                    <Label htmlFor={role} className="text-sm">{role}</Label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="numberOfDependents">Number of people you care for</Label>
              <Input
                id="numberOfDependents"
                type="number"
                min="0"
                value={user.numberOfDependents || ''}
                onChange={(e) => setUser({...user, numberOfDependents: parseInt(e.target.value) || undefined})}
                placeholder="Enter number"
              />
            </div>
          </>
        )}
        
        <div className="space-y-2">
          <Label>Employment Status</Label>
          <Select value={user.employmentStatus || ''} onValueChange={(value) => setUser({...user, employmentStatus: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Select your employment status" />
            </SelectTrigger>
            <SelectContent>
              {EMPLOYMENT_STATUS_OPTIONS.map(status => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>Tax Filing Status</Label>
          <Select value={user.taxFilingStatus || ''} onValueChange={(value) => setUser({...user, taxFilingStatus: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Select your tax filing status" />
            </SelectTrigger>
            <SelectContent>
              {TAX_FILING_STATUS_OPTIONS.map(status => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="householdAGI">Annual Household Income (Optional)</Label>
          <Input 
            id="householdAGI" 
            type="number"
            placeholder="Enter your adjusted gross income" 
            value={user.householdAGI || ''} 
            onChange={(e) => setUser({...user, householdAGI: parseFloat(e.target.value) || undefined})}
          />
          <p className="text-xs text-gray-500">This helps us calculate your potential tax deduction threshold and find relevant assistance programs.</p>
        </div>
      </div>
    </div>
  );
};

export default CaregiverRoleStep;
