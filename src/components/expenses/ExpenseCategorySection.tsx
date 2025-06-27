import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CareRecipient, EXPENSE_CATEGORIES, EXPENSE_SUBCATEGORIES } from '@/types/User';
import MileageCalculator from './MileageCalculator';
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

  return (
    <div className="space-y-4">
      {/* Category Selection */}
      <div className="space-y-2">
        <Label htmlFor="category">Category*</Label>
        <Select onValueChange={handleCategoryChange} defaultValue={category}>
          <SelectTrigger id="category">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {EXPENSE_CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Subcategory Selection */}
      {category && (
        <div className="space-y-2">
          <Label htmlFor="subcategory">Subcategory</Label>
          <Select onValueChange={handleSubcategoryChange} defaultValue={subcategory}>
            <SelectTrigger id="subcategory">
              <SelectValue placeholder="Select a subcategory (optional)" />
            </SelectTrigger>
            <SelectContent>
              {(EXPENSE_SUBCATEGORIES[category] || []).map((subcat) => (
                <SelectItem key={subcat} value={subcat}>
                  {subcat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      
      {/* Mileage Calculator - Updated to include API key */}
      {category === '🚘 Transportation & Travel for Medical Care' && 
       subcategory === 'Mileage for car travel (21 cents/mile in 2024)' && (
        <MileageCalculator 
          onAmountCalculated={onMileageAmountCalculated}
          apiKey={apiKey}
        />
      )}

      {/* Care Recipient Selection */}
      <div className="space-y-2">
        <Label htmlFor="careRecipient">For Whom?</Label>
        <Select onValueChange={handleCareRecipientChange} defaultValue={careRecipientId}>
          <SelectTrigger id="careRecipient">
            <SelectValue placeholder="Select a care recipient (optional)" />
          </SelectTrigger>
          <SelectContent>
            {recipients.map((recipient) => (
              <SelectItem key={recipient.id} value={recipient.id}>
                {recipient.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ExpenseCategorySection;
