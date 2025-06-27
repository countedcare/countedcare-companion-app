
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EXPENSE_CATEGORIES, EXPENSE_SUBCATEGORIES } from '@/types/User';

interface CategorySelectorProps {
  category: string;
  subcategory: string;
  onCategoryChange: (category: string) => void;
  onSubcategoryChange: (subcategory: string) => void;
  required?: boolean;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  category,
  subcategory,
  onCategoryChange,
  onSubcategoryChange,
  required = false
}) => {
  const handleCategoryChange = (newCategory: string) => {
    onCategoryChange(newCategory);
    // Reset subcategory when category changes
    onSubcategoryChange('');
  };

  const availableSubcategories = category ? EXPENSE_SUBCATEGORIES[category as keyof typeof EXPENSE_SUBCATEGORIES] || [] : [];

  return (
    <div className="space-y-4">
      {/* Main Category */}
      <div className="space-y-2">
        <Label htmlFor="category">Category{required && '*'}</Label>
        <Select 
          value={category} 
          onValueChange={handleCategoryChange}
          required={required}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent className="max-h-80">
            {EXPENSE_CATEGORIES.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Subcategory */}
      {category && availableSubcategories.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="subcategory">Specific Type</Label>
          <Select 
            value={subcategory} 
            onValueChange={onSubcategoryChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select specific type (optional)" />
            </SelectTrigger>
            <SelectContent className="max-h-80">
              {availableSubcategories.map(subcat => (
                <SelectItem key={subcat} value={subcat}>{subcat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};

export default CategorySelector;
