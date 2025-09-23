
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { CareRecipient } from '@/types/User';
import MedicalCategorySelector from './MedicalCategorySelector';
import { MEDICAL_CATEGORIES } from '@/lib/medicalCategories';

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
    
    // Auto-set tax deductible for all medical categories
    const isMedicalCategory = MEDICAL_CATEGORIES.some(cat => cat.userFriendlyLabel === value);
    setIsTaxDeductible(isMedicalCategory);
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

        {/* Tax Deductible Status */}
        {isTaxDeductible && (
          <div className="space-y-2 p-3 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              <Label className="text-sm font-medium text-green-800">Tax Deductible Expense</Label>
            </div>
            <p className="text-xs text-green-700">
              Medical expenses over 7.5% of your AGI may be tax deductible. This will be counted toward your tax savings progress.
            </p>
          </div>
        )}

      </CardContent>
    </Card>
  );
};

export default ExpenseCategorySection;
