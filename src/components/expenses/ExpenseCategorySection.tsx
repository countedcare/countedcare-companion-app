
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import CategorySelector from '@/components/expenses/CategorySelector';
import { CareRecipient } from '@/types/User';

interface ExpenseCategorySectionProps {
  category: string;
  setCategory: (category: string) => void;
  subcategory: string;
  setSubcategory: (subcategory: string) => void;
  careRecipientId: string;
  setCareRecipientId: (id: string) => void;
  recipients: CareRecipient[];
}

const ExpenseCategorySection: React.FC<ExpenseCategorySectionProps> = ({
  category,
  setCategory,
  subcategory,
  setSubcategory,
  careRecipientId,
  setCareRecipientId,
  recipients
}) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <CategorySelector
        category={category}
        subcategory={subcategory}
        onCategoryChange={setCategory}
        onSubcategoryChange={setSubcategory}
        required
      />
      
      <div className="space-y-2">
        <Label htmlFor="recipient">Who this is for</Label>
        {recipients.length > 0 ? (
          <Select 
            value={careRecipientId} 
            onValueChange={setCareRecipientId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select care recipient" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="self">Self</SelectItem>
              {recipients.map(recipient => (
                <SelectItem key={recipient.id} value={recipient.id}>
                  {recipient.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <div className="mt-2 mb-4">
            <p className="text-sm text-gray-500 mb-2">
              No care recipients added yet. Add one first:
            </p>
            <Button 
              type="button"
              onClick={() => navigate('/care-recipients/new')}
              className="w-full"
            >
              Add Care Recipient
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseCategorySection;
