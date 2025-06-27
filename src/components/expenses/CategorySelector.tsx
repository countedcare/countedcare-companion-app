
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
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
        
        {/* Display selected category */}
        {category && (
          <div className="p-3 bg-primary/10 border border-primary/20 rounded-md mb-3">
            <div className="flex items-center justify-between">
              <span className="font-medium text-primary">{category}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  onCategoryChange('');
                  onSubcategoryChange('');
                }}
              >
                Change
              </Button>
            </div>
            {subcategory && (
              <div className="mt-2 text-sm text-muted-foreground">
                Specific Type: {subcategory}
              </div>
            )}
          </div>
        )}

        {/* Category selection accordion - only show when no category is selected */}
        {!category && (
          <div className="border rounded-md">
            <Accordion type="single" collapsible className="w-full">
              {EXPENSE_CATEGORIES.map((cat, index) => {
                const availableSubcategories = EXPENSE_SUBCATEGORIES[cat as keyof typeof EXPENSE_SUBCATEGORIES] || [];
                
                return (
                  <AccordionItem key={cat} value={`category-${index}`} className="border-b-0 last:border-b-0">
                    <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50">
                      <div className="flex items-center justify-between w-full mr-2">
                        <span className="text-left font-medium">{cat}</span>
                        <span className="text-xs text-muted-foreground">
                          {availableSubcategories.length} options
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-3">
                      <div className="space-y-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full justify-start mb-3"
                          onClick={() => handleCategorySelect(cat)}
                        >
                          Select "{cat}" (General)
                        </Button>
                        
                        {availableSubcategories.length > 0 && (
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-muted-foreground mb-2">
                              Or select a specific type:
                            </p>
                            {availableSubcategories.map((subcat) => (
                              <Button
                                key={subcat}
                                type="button"
                                variant="ghost"
                                className="w-full justify-start text-left h-auto py-2 px-3 whitespace-normal"
                                onClick={() => {
                                  handleCategorySelect(cat);
                                  handleSubcategorySelect(subcat);
                                }}
                              >
                                <div className="text-sm">{subcat}</div>
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </div>
        )}

        {/* Subcategory selection for already selected category */}
        {category && !subcategory && (
          <div className="space-y-2">
            <Label>Want to be more specific? (Optional)</Label>
            <div className="border rounded-md p-3">
              <div className="space-y-1">
                {(EXPENSE_SUBCATEGORIES[category as keyof typeof EXPENSE_SUBCATEGORIES] || []).map((subcat) => (
                  <Button
                    key={subcat}
                    type="button"
                    variant="ghost"
                    className="w-full justify-start text-left h-auto py-2 px-3 whitespace-normal"
                    onClick={() => handleSubcategorySelect(subcat)}
                  >
                    <div className="text-sm">{subcat}</div>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategorySelector;
