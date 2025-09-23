
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { CareRecipient } from '@/types/User';
import MedicalCategorySelector from './MedicalCategorySelector';

interface ExpenseCategorySectionProps {
  category: string;
  setCategory: (category: string) => void;
  subcategory: string;
  setSubcategory: (subcategory: string) => void;
  careRecipientId: string;
  setCareRecipientId: (id: string) => void;
  recipients: CareRecipient[];
  isTaxDeductible: boolean;
  setIsTaxDeductible: (value: boolean) => void;
}

const ExpenseCategorySection: React.FC<ExpenseCategorySectionProps> = ({
  category,
  setCategory,
  subcategory,
  setSubcategory,
  careRecipientId,
  setCareRecipientId,
  recipients,
  isTaxDeductible,
  setIsTaxDeductible
}) => {
  const [irsReferenceTag, setIrsReferenceTag] = useState('');
  const [irsDescription, setIrsDescription] = useState('');
  const [isPrescribed, setIsPrescribed] = useState<boolean | null>(null);
  const [doctorNote, setDoctorNote] = useState('');

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    setSubcategory(''); // Reset subcategory when category changes
    
    // Auto-check tax deductible for medical categories
    const isMedicalCategory = [
      'Medical Visits', 'Prescriptions', 'Dental', 'Vision', 'Therapy', 
      'Hospital/Emergency', 'Medical Equipment', 'Home Modifications', 
      'Transportation', 'Other Medical'
    ].includes(value);
    
    if (isMedicalCategory) {
      setIsTaxDeductible(true);
    }
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

  const handleDoctorPrescriptionChange = (prescribed: boolean, note?: string) => {
    setIsPrescribed(prescribed);
    setDoctorNote(note || '');
  };

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
          onDoctorPrescriptionChange={handleDoctorPrescriptionChange}
        />

        {/* Care Recipient Selection */}
        <div className="space-y-2">
          <Label htmlFor="care-recipient">Care Recipient</Label>
          <Select value={careRecipientId} onValueChange={handleCareRecipientChange}>
            <SelectTrigger>
              <SelectValue placeholder="Who is this expense for?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="myself">Myself</SelectItem>
              {recipients.filter(recipient => recipient.id?.trim()).map((recipient) => (
                <SelectItem key={recipient.id} value={recipient.id}>
                  {recipient.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tax Deductible Checkbox */}
        <div className="space-y-3">
          <Label>Tax Information</Label>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="tax-deductible"
              checked={isTaxDeductible}
              onCheckedChange={(checked) => setIsTaxDeductible(checked === true)}
            />
            <Label htmlFor="tax-deductible" className="text-sm font-normal cursor-pointer">
              This expense may be tax deductible
            </Label>
          </div>
          <p className="text-xs text-muted-foreground">
            Medical expenses over 7.5% of your AGI may be tax deductible. Consult a tax professional for advice.
          </p>
        </div>

      </CardContent>
    </Card>
  );
};

export default ExpenseCategorySection;
