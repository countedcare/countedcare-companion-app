
import React from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { User, RELATIONSHIP_TYPES } from '@/types/User';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  return (
    <div>
      <h2 className="text-xl font-heading mb-4">Your Caregiving Role</h2>
      <div className="space-y-4">
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
          <div className="space-y-2">
            <Label htmlFor="caregivingFor">Who are you caring for?</Label>
            <Select 
              value={selectedRelationship}
              onValueChange={(value) => setSelectedRelationship(value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select relationship" />
              </SelectTrigger>
              <SelectContent>
                {RELATIONSHIP_TYPES.map((relationship) => (
                  <SelectItem key={relationship} value={relationship}>
                    {relationship}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {user.caregivingFor && user.caregivingFor.length > 0 && (
              <div className="mt-2">
                <p className="text-sm text-gray-500">Selected relationships:</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {user.caregivingFor.map((relation, index) => (
                    <div key={index} className="bg-primary/10 text-primary px-2 py-1 rounded-md text-sm flex items-center">
                      {relation}
                      <button 
                        className="ml-2 hover:text-destructive"
                        onClick={() => setUser({
                          ...user,
                          caregivingFor: user.caregivingFor?.filter((r) => r !== relation)
                        })}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="householdAGI">Household AGI (Optional)</Label>
          <Input 
            id="householdAGI" 
            type="number"
            placeholder="Enter your adjusted gross income" 
            value={user.householdAGI || ''} 
            onChange={(e) => setUser({...user, householdAGI: parseFloat(e.target.value) || undefined})}
          />
          <p className="text-xs text-gray-500">This helps us calculate your potential tax deduction threshold.</p>
        </div>
      </div>
    </div>
  );
};

export default CaregiverRoleStep;
