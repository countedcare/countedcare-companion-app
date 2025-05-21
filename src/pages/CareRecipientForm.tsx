
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import Layout from '@/components/Layout';
import useLocalStorage from '@/hooks/useLocalStorage';
import { CareRecipient } from '@/types/User';

// Common relationships
const relationships = [
  'Parent', 'Child', 'Spouse', 'Sibling', 'Grandparent', 'Other Family', 'Friend', 'Client'
];

// Common medical conditions
const commonConditions = [
  'Alzheimer\'s/Dementia',
  'Arthritis',
  'Cancer',
  'Diabetes',
  'Heart Disease',
  'Hypertension',
  'Mobility Issues',
  'Parkinson\'s',
  'Respiratory Condition',
  'Stroke Recovery',
  'Vision Impairment',
  'Special Needs'
];

const CareRecipientForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [recipients, setRecipients] = useLocalStorage<CareRecipient[]>('countedcare-recipients', []);
  const [expenses, setExpenses] = useLocalStorage<Expense[]>('countedcare-expenses', []);
  
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [insuranceInfo, setInsuranceInfo] = useState('');
  
  // For editing mode
  useEffect(() => {
    if (id) {
      const recipientToEdit = recipients.find(recipient => recipient.id === id);
      if (recipientToEdit) {
        setName(recipientToEdit.name);
        setRelationship(recipientToEdit.relationship);
        setSelectedConditions(recipientToEdit.conditions || []);
        setInsuranceInfo(recipientToEdit.insuranceInfo || '');
      }
    }
  }, [id, recipients]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!name || !relationship) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    const recipientData: CareRecipient = {
      id: id || `recipient-${Date.now()}`,
      name,
      relationship,
      conditions: selectedConditions,
      insuranceInfo
    };
    
    if (id) {
      // Update existing recipient
      setRecipients(recipients.map(recipient => 
        recipient.id === id ? recipientData : recipient
      ));
      toast({
        title: "Care Recipient Updated",
        description: "Care recipient information has been updated successfully."
      });
    } else {
      // Add new recipient
      setRecipients([...recipients, recipientData]);
      toast({
        title: "Care Recipient Added",
        description: "Care recipient has been added successfully."
      });
    }
    
    navigate('/care-recipients');
  };
  
  const handleDelete = () => {
    if (id) {
      // Check if any expenses are linked to this recipient
      const linkedExpenses = expenses.filter(expense => expense.careRecipientId === id);
      
      if (linkedExpenses.length > 0) {
        toast({
          title: "Cannot Delete",
          description: `This care recipient has ${linkedExpenses.length} expenses linked to them. Please delete or reassign these expenses first.`,
          variant: "destructive",
        });
        return;
      }
      
      setRecipients(recipients.filter(recipient => recipient.id !== id));
      toast({
        title: "Care Recipient Deleted",
        description: "Care recipient has been deleted successfully."
      });
      navigate('/care-recipients');
    }
  };
  
  const toggleCondition = (condition: string) => {
    setSelectedConditions(prev =>
      prev.includes(condition)
        ? prev.filter(c => c !== condition)
        : [...prev, condition]
    );
  };
  
  return (
    <Layout>
      <div className="container-padding py-6">
        <h1 className="text-2xl font-heading mb-6">
          {id ? 'Edit' : 'Add'} Care Recipient
        </h1>
        
        <form onSubmit={handleSubmit}>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name*</Label>
                  <Input
                    id="name"
                    placeholder="Full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="relationship">Relationship*</Label>
                  <Select 
                    value={relationship} 
                    onValueChange={setRelationship}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      {relationships.map(rel => (
                        <SelectItem key={rel} value={rel}>{rel}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Medical Conditions</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {commonConditions.map(condition => (
                      <div key={condition} className="flex items-center space-x-2">
                        <Checkbox
                          id={`condition-${condition}`}
                          checked={selectedConditions.includes(condition)}
                          onCheckedChange={() => toggleCondition(condition)}
                        />
                        <label
                          htmlFor={`condition-${condition}`}
                          className="text-sm cursor-pointer"
                        >
                          {condition}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="insurance">Insurance Information</Label>
                  <Textarea
                    id="insurance"
                    placeholder="Enter insurance details, policy numbers, etc."
                    value={insuranceInfo}
                    onChange={(e) => setInsuranceInfo(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="mt-6 space-y-3">
                <Button type="submit" className="w-full bg-primary">
                  {id ? 'Update' : 'Save'} Care Recipient
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/care-recipients')} 
                  className="w-full"
                >
                  Cancel
                </Button>
                
                {id && (
                  <Button 
                    type="button" 
                    variant="destructive" 
                    onClick={handleDelete} 
                    className="w-full"
                  >
                    Delete Care Recipient
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </Layout>
  );
};

export default CareRecipientForm;
