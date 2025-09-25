import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Star, Receipt, DollarSign, Clock, Filter, X } from 'lucide-react';

interface QuickFiltersProps {
  onFilterApply: (filterType: string, value?: any) => void;
  activeFilters: Record<string, any>;
  onClearFilter: (filterType: string) => void;
  expenseStats: {
    total: number;
    deductible: number;
    thisMonth: number;
    pending: number;
  };
}

export function QuickFilters({ onFilterApply, activeFilters, onClearFilter, expenseStats }: QuickFiltersProps) {
  const quickFilters = [
    {
      key: 'thisMonth',
      label: 'This Month',
      icon: Calendar,
      count: expenseStats.thisMonth,
      color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
      action: () => {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        onFilterApply('dateRange', { from: firstDay, to: now });
      }
    },
    {
      key: 'deductible',
      label: 'Tax Deductible',
      icon: Star,
      count: expenseStats.deductible,
      color: 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100',
      action: () => onFilterApply('filterDeductible', 'deductible')
    },
    {
      key: 'missingReceipts',
      label: 'Missing Receipts',
      icon: Receipt,
      count: 0, // This would need to be calculated
      color: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100',
      action: () => onFilterApply('missingReceipts', true)
    },
    {
      key: 'largeExpenses',
      label: 'Large Expenses',
      icon: DollarSign,
      count: 0, // This would need to be calculated  
      color: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100',
      action: () => onFilterApply('largeExpenses', true)
    },
    {
      key: 'needsReview',
      label: 'Needs Review',
      icon: Clock,
      count: expenseStats.pending,
      color: 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100',
      action: () => onFilterApply('triageFilter', 'pending')
    }
  ];

  const hasActiveFilters = Object.keys(activeFilters).some(key => activeFilters[key] !== '' && activeFilters[key] !== 'all');

  return (
    <div className="space-y-3">
      {/* Quick Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        {quickFilters.map((filter) => (
          <Button
            key={filter.key}
            variant="outline"
            size="sm"
            className={`${filter.color} transition-all duration-200 hover-scale`}
            onClick={filter.action}
          >
            <filter.icon className="h-3 w-3 mr-2" />
            {filter.label}
            {filter.count > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 px-2 text-xs">
                {filter.count}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600">Active filters:</span>
          <div className="flex flex-wrap gap-1">
            {Object.entries(activeFilters).map(([key, value]) => {
              if (!value || value === '' || value === 'all') return null;
              
              return (
                <Badge 
                  key={key} 
                  variant="secondary" 
                  className="flex items-center gap-1 px-2 py-1"
                >
                  <span className="text-xs">
                    {key === 'filterDeductible' && value === 'deductible' ? 'Tax Deductible' :
                     key === 'triageFilter' && value === 'pending' ? 'Needs Review' :
                     key === 'dateRange' ? 'This Month' :
                     key === 'filterCategory' ? `Category: ${value}` :
                     key === 'searchTerm' ? `Search: ${value}` :
                     value}
                  </span>
                  <button
                    onClick={() => onClearFilter(key)}
                    className="hover:bg-gray-300 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              );
            })}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              Object.keys(activeFilters).forEach(key => onClearFilter(key));
            }}
            className="text-xs"
          >
            Clear All
          </Button>
        </div>
      )}
    </div>
  );
}