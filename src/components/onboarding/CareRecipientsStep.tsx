import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, X, User } from 'lucide-react';
import { RELATIONSHIP_TYPES } from '@/types/User';

interface CareRecipient {
  name: string;
  relationship: string;
  tempId: string;
}

interface CareRecipientsStepProps {
  careRecipients: CareRecipient[];
  setCareRecipients: (recipients: CareRecipient[]) => void;
  householdAGI?: number;
  setHouseholdAGI: (agi: number | undefined) => void;
}

const CareRecipientsStep: React.FC<CareRecipientsStepProps> = ({ 
  careRecipients, 
  setCareRecipients,
  householdAGI,
  setHouseholdAGI
}) => {
  const [newRecipient, setNewRecipient] = useState<CareRecipient>({
    name: '',
    relationship: '',
    tempId: ''
  });

  const addRecipient = () => {
    if (newRecipient.name && newRecipient.relationship) {
      const recipient = {
        ...newRecipient,
        tempId: Date.now().toString()
      };
      setCareRecipients([...careRecipients, recipient]);
      setNewRecipient({ name: '', relationship: '', tempId: '' });
    }
  };

  const removeRecipient = (tempId: string) => {
    setCareRecipients(careRecipients.filter(r => r.tempId !== tempId));
  };

  return (
    <div>
      <div className="mb-6 text-center">
        <div className="bg-primary/10 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <User className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-xl font-heading font-semibold mb-2">Who Do You Care For?</h2>
        <p className="text-gray-600 text-sm">
          Add the people you provide care for to personalize your experience and track expenses.
        </p>
      </div>
      
      <div className="space-y-6">
        {/* Add new care recipient form */}
        <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <Label className="text-sm font-medium">Add a care recipient</Label>
          
          <div className="grid grid-cols-1 gap-3">
            <Input
              placeholder="Name (e.g., Mom, Dad, Sarah)"
              value={newRecipient.name}
              onChange={(e) => setNewRecipient({ ...newRecipient, name: e.target.value })}
            />
            
            <Select 
              value={newRecipient.relationship} 
              onValueChange={(value) => setNewRecipient({ ...newRecipient, relationship: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select relationship" />
              </SelectTrigger>
              <SelectContent>
                {RELATIONSHIP_TYPES.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            type="button"
            variant="outline" 
            size="sm"
            onClick={addRecipient}
            disabled={!newRecipient.name || !newRecipient.relationship}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Person
          </Button>
        </div>

        {/* List of added care recipients */}
        {careRecipients.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">People you care for:</Label>
            {careRecipients.map((recipient) => (
              <Card key={recipient.tempId} className="border border-gray-200">
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-primary/10 rounded-full p-2">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{recipient.name}</p>
                      <p className="text-xs text-gray-500">{recipient.relationship}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeRecipient(recipient.tempId)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {careRecipients.length === 0 && (
          <div className="text-center p-6 text-gray-500">
            <User className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p className="text-sm">No care recipients added yet</p>
            <p className="text-xs mt-1">You can skip this step and add them later</p>
          </div>
        )}

        {/* Household income section */}
        <div className="space-y-2">
          <Label htmlFor="householdAGI">Annual Household Income (Optional)</Label>
          <Input 
            id="householdAGI" 
            type="number"
            placeholder="Enter your adjusted gross income" 
            value={householdAGI || ''} 
            onChange={(e) => setHouseholdAGI(parseFloat(e.target.value) || undefined)}
          />
          <p className="text-xs text-gray-500">
            This helps us calculate your potential tax deduction threshold and find relevant assistance programs.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CareRecipientsStep;