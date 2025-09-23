import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X, Filter } from 'lucide-react';
import { ResourceCategory } from '@/hooks/useResourcesSystem';

interface Filters {
  category?: ResourceCategory;
  state?: string;
  county?: string;
  tags?: string[];
}

interface ResourceFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  sortBy: string;
  onSortChange: (sortBy: string) => void;
  className?: string;
}

const ResourceFilters: React.FC<ResourceFiltersProps> = ({
  filters,
  onFiltersChange,
  sortBy,
  onSortChange,
  className = ''
}) => {
  const categoryOptions = [
    { value: 'federal', label: 'Federal' },
    { value: 'state', label: 'California' },
    { value: 'county', label: 'Los Angeles County' },
    { value: 'nonprofit', label: 'Nonprofit' }
  ];

  const sortOptions = [
    { value: 'recommended', label: 'Recommended' },
    { value: 'az', label: 'A–Z' },
    { value: 'newest', label: 'Newest' },
    { value: 'savings', label: 'Estimated Savings' }
  ];

  const clearFilter = (filterKey: keyof Filters) => {
    const newFilters = { ...filters };
    delete newFilters[filterKey];
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Filter Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Filter className="h-4 w-4" />
          Filter by
        </div>
        
        {/* Category Filter */}
        <Select 
          value={filters.category || 'all'} 
          onValueChange={(value) => 
            onFiltersChange({ 
              ...filters, 
              category: value === 'all' ? undefined : value as ResourceCategory 
            })
          }
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categoryOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Sort</span>
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Clear All Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-gray-600 hover:text-gray-800"
          >
            Clear all
            <X className="ml-1 h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.category && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {categoryOptions.find(opt => opt.value === filters.category)?.label}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-1 hover:bg-transparent"
                onClick={() => clearFilter('category')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {filters.state && (
            <Badge variant="secondary" className="flex items-center gap-1">
              State: {filters.state}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-1 hover:bg-transparent"
                onClick={() => clearFilter('state')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}

          {filters.county && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {filters.county}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-1 hover:bg-transparent"
                onClick={() => clearFilter('county')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default ResourceFilters;