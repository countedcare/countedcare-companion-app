
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { CareRecipient, EXPENSE_CATEGORIES } from '@/types/User';

interface SmartFiltersProps {
  filterCategory: string;
  setFilterCategory: (value: string) => void;
  filterRecipient: string;
  setFilterRecipient: (value: string) => void;
  filterDeductible: string;
  setFilterDeductible: (value: string) => void;
  recipients: CareRecipient[];
  onClearFilters: () => void;
}

const SmartFilters: React.FC<SmartFiltersProps> = ({
  filterCategory,
  setFilterCategory,
  filterRecipient,
  setFilterRecipient,
  filterDeductible,
  setFilterDeductible,
  recipients,
  onClearFilters
}) => {
  const activeFiltersCount = [filterCategory, filterRecipient, filterDeductible].filter(filter => 
    filter && filter !== 'all-categories' && filter !== 'all-recipients' && filter !== 'all'
  ).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">Smart Filters</h3>
        {activeFiltersCount > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClearFilters}
            className="text-xs"
          >
            <X className="h-3 w-3 mr-1" />
            Clear ({activeFiltersCount})
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Category</label>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-categories">All Categories</SelectItem>
              {EXPENSE_CATEGORIES.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Care Recipient</label>
          <Select value={filterRecipient} onValueChange={setFilterRecipient}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All recipients" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-recipients">All Recipients</SelectItem>
              <SelectItem value="self">Self</SelectItem>
              {recipients.map(recipient => (
                <SelectItem key={recipient.id} value={recipient.id}>{recipient.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Tax Status</label>
          <Select value={filterDeductible} onValueChange={setFilterDeductible}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All expenses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Expenses</SelectItem>
              <SelectItem value="deductible">Tax Deductible</SelectItem>
              <SelectItem value="non-deductible">Not Deductible</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default SmartFilters;
