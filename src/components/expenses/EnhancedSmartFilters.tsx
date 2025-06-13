
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X, Filter, CreditCard, PenTool } from 'lucide-react';
import { CareRecipient, EXPENSE_CATEGORIES } from '@/types/User';

interface EnhancedSmartFiltersProps {
  filterCategory: string;
  setFilterCategory: (value: string) => void;
  filterRecipient: string;
  setFilterRecipient: (value: string) => void;
  filterDeductible: string;
  setFilterDeductible: (value: string) => void;
  filterSource: string;
  setFilterSource: (value: string) => void;
  recipients: CareRecipient[];
  onClearFilters: () => void;
}

const EnhancedSmartFilters: React.FC<EnhancedSmartFiltersProps> = ({
  filterCategory,
  setFilterCategory,
  filterRecipient,
  setFilterRecipient,
  filterDeductible,
  setFilterDeductible,
  filterSource,
  setFilterSource,
  recipients,
  onClearFilters
}) => {
  const activeFiltersCount = [filterCategory, filterRecipient, filterDeductible, filterSource]
    .filter(filter => filter && !filter.startsWith('all')).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground flex items-center">
          <Filter className="h-4 w-4 mr-2" />
          Smart Filters
        </h3>
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
      
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="basic">Basic Filters</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic" className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
          </div>
        </TabsContent>
        
        <TabsContent value="advanced" className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
            
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground flex items-center">
                Entry Method
              </label>
              <Select value={filterSource} onValueChange={setFilterSource}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All sources" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-sources">All Sources</SelectItem>
                  <SelectItem value="manual">
                    <div className="flex items-center">
                      <PenTool className="h-3 w-3 mr-2" />
                      Manual Entry
                    </div>
                  </SelectItem>
                  <SelectItem value="auto-imported">
                    <div className="flex items-center">
                      <CreditCard className="h-3 w-3 mr-2" />
                      Auto-Imported
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2 pt-2 border-t">
              <span className="text-xs text-muted-foreground">Active filters:</span>
              {filterCategory && filterCategory !== 'all-categories' && (
                <Badge variant="secondary" className="text-xs">
                  Category: {filterCategory}
                </Badge>
              )}
              {filterRecipient && filterRecipient !== 'all-recipients' && (
                <Badge variant="secondary" className="text-xs">
                  Recipient: {filterRecipient === 'self' ? 'Self' : recipients.find(r => r.id === filterRecipient)?.name}
                </Badge>
              )}
              {filterDeductible && filterDeductible !== 'all' && (
                <Badge variant="secondary" className="text-xs">
                  {filterDeductible === 'deductible' ? 'Tax Deductible' : 'Not Deductible'}
                </Badge>
              )}
              {filterSource && filterSource !== 'all-sources' && (
                <Badge variant="secondary" className="text-xs flex items-center">
                  {filterSource === 'manual' ? (
                    <>
                      <PenTool className="h-3 w-3 mr-1" />
                      Manual
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-3 w-3 mr-1" />
                      Auto-Imported
                    </>
                  )}
                </Badge>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedSmartFilters;
