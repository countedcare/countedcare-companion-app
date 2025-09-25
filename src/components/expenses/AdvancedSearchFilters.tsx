import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { 
  X, 
  Filter, 
  Search, 
  Calendar,
  DollarSign,
  Tag,
  Clock,
  ArrowUpDown,
  BookmarkPlus,
  RotateCcw
} from 'lucide-react';
import { CareRecipient, EXPENSE_CATEGORIES } from '@/types/User';
import { DateRange } from 'react-day-picker';
import { format, subDays, startOfMonth, endOfMonth, startOfYear } from 'date-fns';
import { cn } from '@/lib/utils';

interface AdvancedSearchFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filterCategory: string;
  setFilterCategory: (value: string) => void;
  filterRecipient: string;
  setFilterRecipient: (value: string) => void;
  filterDeductible: string;
  setFilterDeductible: (value: string) => void;
  filterSource: string;
  setFilterSource: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  triageFilter: string;
  setTriageFilter: (value: string) => void;
  sortBy: string;
  setSortBy: (value: string) => void;
  dateRange: DateRange | undefined;
  setDateRange: (value: DateRange | undefined) => void;
  amountRange: [number, number];
  setAmountRange: (value: [number, number]) => void;
  recipients: CareRecipient[];
  onClearFilters: () => void;
}

interface FilterPreset {
  name: string;
  filters: {
    category?: string;
    deductible?: string;
    dateRange?: DateRange;
    sortBy?: string;
  };
}

const AdvancedSearchFilters: React.FC<AdvancedSearchFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  filterCategory,
  setFilterCategory,
  filterRecipient,
  setFilterRecipient,
  filterDeductible,
  setFilterDeductible,
  filterSource,
  setFilterSource,
  statusFilter,
  setStatusFilter,
  triageFilter,
  setTriageFilter,
  sortBy,
  setSortBy,
  dateRange,
  setDateRange,
  amountRange,
  setAmountRange,
  recipients,
  onClearFilters
}) => {
  const [searchFields, setSearchFields] = useState<string[]>(['description', 'vendor', 'category']);
  const [savedPresets, setSavedPresets] = useState<FilterPreset[]>([
    {
      name: "Tax Deductible This Year",
      filters: {
        category: "all-categories",
        deductible: "deductible",
        dateRange: { 
          from: startOfYear(new Date()), 
          to: new Date() 
        },
        sortBy: "amount-desc"
      }
    },
    {
      name: "Recent Medical Expenses",
      filters: {
        category: "Medical",
        dateRange: { 
          from: subDays(new Date(), 30), 
          to: new Date() 
        },
        sortBy: "date-desc"
      }
    }
  ]);

  const activeFiltersCount = [
    searchTerm,
    filterCategory !== '' && filterCategory !== 'all-categories',
    filterRecipient !== '' && filterRecipient !== 'all-recipients',
    filterDeductible !== '' && filterDeductible !== 'all',
    filterSource !== '' && filterSource !== 'all-sources',
    statusFilter !== '' && statusFilter !== 'all',
    triageFilter !== '' && triageFilter !== 'all',
    dateRange,
    amountRange[0] > 0 || amountRange[1] < 10000,
  ].filter(Boolean).length;

  const applyPreset = (preset: FilterPreset) => {
    if (preset.filters.category) setFilterCategory(preset.filters.category);
    if (preset.filters.deductible) setFilterDeductible(preset.filters.deductible);
    if (preset.filters.dateRange) setDateRange(preset.filters.dateRange);
    if (preset.filters.sortBy) setSortBy(preset.filters.sortBy);
  };

  const setDatePreset = (preset: string) => {
    const today = new Date();
    let range: DateRange;

    switch (preset) {
      case 'today':
        range = { from: today, to: today };
        break;
      case 'yesterday':
        const yesterday = subDays(today, 1);
        range = { from: yesterday, to: yesterday };
        break;
      case 'last7days':
        range = { from: subDays(today, 7), to: today };
        break;
      case 'last30days':
        range = { from: subDays(today, 30), to: today };
        break;
      case 'thisMonth':
        range = { from: startOfMonth(today), to: endOfMonth(today) };
        break;
      case 'thisYear':
        range = { from: startOfYear(today), to: today };
        break;
      default:
        return;
    }
    setDateRange(range);
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <Search className="h-5 w-5 mr-2" />
            Advanced Search & Filters
          </CardTitle>
          {activeFiltersCount > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {activeFiltersCount} active
              </Badge>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClearFilters}
                className="text-xs"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Reset
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Enhanced Search Bar */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Search Expenses</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by description, vendor, category, notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Tabs defaultValue="filters" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="filters">Filters</TabsTrigger>
            <TabsTrigger value="amounts">Amount & Date</TabsTrigger>
            <TabsTrigger value="presets">Quick Presets</TabsTrigger>
          </TabsList>

          {/* Basic Filters Tab */}
          <TabsContent value="filters" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Category</label>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger>
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

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Care Recipient</label>
                <Select value={filterRecipient} onValueChange={setFilterRecipient}>
                  <SelectTrigger>
                    <SelectValue placeholder="All recipients" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-recipients">All Recipients</SelectItem>
                    <SelectItem value="self">
                      <div className="flex items-center justify-between w-full">
                        <span>Self (Personal)</span>
                      </div>
                    </SelectItem>
                    {recipients.length > 0 && (
                      <>
                        {recipients.map(recipient => (
                          <SelectItem key={recipient.id} value={recipient.id}>
                            <div className="flex items-center justify-between w-full">
                              <span>{recipient.name}</span>
                              <span className="text-xs text-muted-foreground ml-2">
                                {recipient.relationship}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </>
                    )}
                  </SelectContent>
                </Select>
                {recipients.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    Add care recipients in your profile to filter expenses by person
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Tax Status</label>
                <Select value={filterDeductible} onValueChange={setFilterDeductible}>
                  <SelectTrigger>
                    <SelectValue placeholder="All expenses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Expenses</SelectItem>
                    <SelectItem value="deductible">Tax Deductible</SelectItem>
                    <SelectItem value="non-deductible">Not Deductible</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Entry Method</label>
                <Select value={filterSource} onValueChange={setFilterSource}>
                  <SelectTrigger>
                    <SelectValue placeholder="All sources" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-sources">All Sources</SelectItem>
                    <SelectItem value="manual">Manual Entry</SelectItem>
                    <SelectItem value="auto-imported">Auto-Imported</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Expenses</SelectItem>
                    <SelectItem value="deductible">Tax Deductible</SelectItem>
                    <SelectItem value="reimbursed">Reimbursed</SelectItem>
                    <SelectItem value="pending-reimbursement">Pending Reimbursement</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Sort By</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Date (newest first)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date-desc">Date (newest first)</SelectItem>
                    <SelectItem value="date-asc">Date (oldest first)</SelectItem>
                    <SelectItem value="amount-desc">Amount (highest first)</SelectItem>
                    <SelectItem value="amount-asc">Amount (lowest first)</SelectItem>
                    <SelectItem value="category">Category (A-Z)</SelectItem>
                    <SelectItem value="vendor">Vendor (A-Z)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          {/* Amount & Date Tab */}
          <TabsContent value="amounts" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Amount Range */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-muted-foreground flex items-center">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Amount Range
                </label>
                <div className="space-y-3">
                  <Slider
                    value={amountRange}
                    onValueChange={setAmountRange}
                    max={10000}
                    min={0}
                    step={25}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>${amountRange[0]}</span>
                    <span>${amountRange[1] >= 10000 ? '10000+' : amountRange[1]}</span>
                  </div>
                </div>
              </div>

              {/* Date Range */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-muted-foreground flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Date Range
                </label>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDatePreset('last7days')}
                      className={cn(
                        "text-xs",
                        dateRange?.from && format(dateRange.from, 'yyyy-MM-dd') === format(subDays(new Date(), 7), 'yyyy-MM-dd') && "bg-primary/10"
                      )}
                    >
                      Last 7 days
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDatePreset('last30days')}
                      className={cn(
                        "text-xs",
                        dateRange?.from && format(dateRange.from, 'yyyy-MM-dd') === format(subDays(new Date(), 30), 'yyyy-MM-dd') && "bg-primary/10"
                      )}
                    >
                      Last 30 days
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDatePreset('thisMonth')}
                      className="text-xs"
                    >
                      This month
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDatePreset('thisYear')}
                      className="text-xs"
                    >
                      This year
                    </Button>
                  </div>
                  
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dateRange && "text-muted-foreground"
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {dateRange?.from ? (
                          dateRange.to ? (
                            <>
                              {format(dateRange.from, "LLL dd, y")} -{" "}
                              {format(dateRange.to, "LLL dd, y")}
                            </>
                          ) : (
                            format(dateRange.from, "LLL dd, y")
                          )
                        ) : (
                          <span>Pick a date range</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange?.from}
                        selected={dateRange}
                        onSelect={setDateRange}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Quick Presets Tab */}
          <TabsContent value="presets" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {savedPresets.map((preset, index) => (
                <Button
                  key={index}
                  variant="outline"
                  onClick={() => applyPreset(preset)}
                  className="justify-start h-auto p-4"
                >
                  <div className="text-left">
                    <div className="font-medium text-sm">{preset.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Quick filter preset
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 pt-4 border-t">
            <span className="text-sm font-medium text-muted-foreground">Active filters:</span>
            
            {searchTerm && (
              <Badge variant="secondary" className="text-xs">
                Search: "{searchTerm}"
                <X 
                  className="h-3 w-3 ml-1 cursor-pointer" 
                  onClick={() => setSearchTerm('')}
                />
              </Badge>
            )}
            
            {filterCategory && filterCategory !== 'all-categories' && (
              <Badge variant="secondary" className="text-xs">
                Category: {filterCategory}
                <X 
                  className="h-3 w-3 ml-1 cursor-pointer" 
                  onClick={() => setFilterCategory('all-categories')}
                />
              </Badge>
            )}
            
            {filterRecipient && filterRecipient !== 'all-recipients' && (
              <Badge variant="secondary" className="text-xs">
                Recipient: {filterRecipient === 'self' ? 'Self' : recipients.find(r => r.id === filterRecipient)?.name}
                <X 
                  className="h-3 w-3 ml-1 cursor-pointer" 
                  onClick={() => setFilterRecipient('all-recipients')}
                />
              </Badge>
            )}
            
            {filterDeductible && filterDeductible !== 'all' && (
              <Badge variant="secondary" className="text-xs">
                {filterDeductible === 'deductible' ? 'Tax Deductible' : 'Not Deductible'}
                <X 
                  className="h-3 w-3 ml-1 cursor-pointer" 
                  onClick={() => setFilterDeductible('all')}
                />
              </Badge>
            )}
            
            {dateRange && (
              <Badge variant="secondary" className="text-xs">
                Date: {format(dateRange.from!, "MMM dd")} - {format(dateRange.to || dateRange.from!, "MMM dd")}
                <X 
                  className="h-3 w-3 ml-1 cursor-pointer" 
                  onClick={() => setDateRange(undefined)}
                />
              </Badge>
            )}
            
            {(amountRange[0] > 0 || amountRange[1] < 10000) && (
              <Badge variant="secondary" className="text-xs">
                Amount: ${amountRange[0]} - ${amountRange[1] >= 10000 ? '10000+' : amountRange[1]}
                <X 
                  className="h-3 w-3 ml-1 cursor-pointer" 
                  onClick={() => setAmountRange([0, 10000])}
                />
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdvancedSearchFilters;