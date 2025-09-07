
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CareRecipient } from '@/types/User';
import MileageCalculator from './MileageCalculator';
import MedicalCategorySelector from './MedicalCategorySelector';
import useGoogleMapsAPI from '@/hooks/useGoogleMapsAPI';

interface ExpenseCategorySectionProps {
  category: string;
  setCategory: (category: string) => void;
  subcategory: string;
  setSubcategory: (subcategory: string) => void;
  careRecipientId: string;
  setCareRecipientId: (id: string) => void;
  recipients: CareRecipient[];
  onMileageAmountCalculated: (amount: number) => void;
}

const ExpenseCategorySection: React.FC<ExpenseCategorySectionProps> = ({
  category,
  setCategory,
  subcategory,
  setSubcategory,
  careRecipientId,
  setCareRecipientId,
  recipients,
  onMileageAmountCalculated
}) => {
  const { apiKey } = useGoogleMapsAPI();
  const [irsReferenceTag, setIrsReferenceTag] = useState('');
  const [irsDescription, setIrsDescription] = useState('');

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    setSubcategory(''); // Reset subcategory when category changes
  };

  const handleSubcategoryChange = (value: string) => {
    setSubcategory(value);
  };

  const handleCareRecipientChange = (value: string) => {
    setCareRecipientId(value);
  };

  const handleIrsDataChange = (tag: string, description: string) => {
    setIrsReferenceTag(tag);
    setIrsDescription(description);
  };

  const isMileageMode = 
    category === 'Transportation & Travel' && 
    (subcategory?.toLowerCase().includes('mileage') || subcategory?.toLowerCase().includes('mile'));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Expense Category & Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Medical Category Selector */}
        <MedicalCategorySelector
          selectedCategory={category}
          selectedSubcategory={subcategory}
          onCategoryChange={handleCategoryChange}
          onSubcategoryChange={handleSubcategoryChange}
          onIrsDataChange={handleIrsDataChange}
        />

        {/* Care Recipient Selection */}
        <div className="space-y-2">
          <Label htmlFor="care-recipient">Care Recipient</Label>
          <Select value={careRecipientId} onValueChange={handleCareRecipientChange}>
            <SelectTrigger>
              <SelectValue placeholder="Who is this expense for?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="self">Myself</SelectItem>
              {recipients.map((recipient) => (
                <SelectItem key={recipient.id} value={recipient.id}>
                  {recipient.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Mileage Calculator for Transportation */}
        {isMileageMode && (
          <MileageCalculator 
            onAmountCalculated={onMileageAmountCalculated}
            apiKey={apiKey}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default ExpenseCategorySection;
