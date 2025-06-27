
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EXPENSE_CATEGORIES, EXPENSE_SUBCATEGORIES } from '@/types/User';
import { Check } from 'lucide-react';

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
  const handleCategorySelect = (selectedCategory: string) => {
    onCategoryChange(selectedCategory);
    // Reset subcategory when category changes
    onSubcategoryChange('');
  };

  const handleSubcategorySelect = (selectedSubcategory: string) => {
    onSubcategoryChange(selectedSubcategory);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="category">Category{required && '*'}</Label>
        
        {/* Category Selection Dropdown */}
        <Select value={category} onValueChange={handleCategorySelect}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent className="bg-white z-50">
            {EXPENSE_CATEGORIES.map((cat) => {
              const availableSubcategories = EXPENSE_SUBCATEGORIES[cat as keyof typeof EXPENSE_SUBCATEGORIES] || [];
              
              return (
                <SelectItem key={cat} value={cat} className="cursor-pointer">
                  <div className="flex items-center justify-between w-full">
                    <span>{cat}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {availableSubcategories.length} options
                    </span>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        {/* Subcategory selection for selected category */}
        {category && (
          <div className="space-y-2">
            <Label>Specific Type (Optional)</Label>
            <Select value={subcategory} onValueChange={handleSubcategorySelect}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a specific type (optional)" />
              </SelectTrigger>
              <SelectContent className="bg-white z-50 max-h-60 overflow-y-auto">
                <SelectItem value="" className="cursor-pointer">
                  General - {category}
                </SelectItem>
                {(EXPENSE_SUBCATEGORIES[category as keyof typeof EXPENSE_SUBCATEGORIES] || []).map((subcat) => (
                  <SelectItem key={subcat} value={subcat} className="cursor-pointer">
                    {subcat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Display selected category and subcategory */}
        {category && (
          <div className="p-3 bg-primary/10 border border-primary/20 rounded-md">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium text-primary">{category}</span>
                {subcategory && (
                  <div className="text-sm text-muted-foreground mt-1">
                    Specific Type: {subcategory}
                  </div>
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  onCategoryChange('');
                  onSubcategoryChange('');
                }}
              >
                Clear
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategorySelector;
