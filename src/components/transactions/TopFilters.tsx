import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Filter } from 'lucide-react';

interface TopFiltersProps {
  sort: string;
  setSort: (value: string) => void;
  filter: string;
  setFilter: (value: string) => void;
  onSync: () => void;
  isSyncing?: boolean;
  totalPending?: number;
  totalCandidates?: number;
  linkedAccountsCount?: number;
}

export function TopFilters({
  sort,
  setSort,
  filter,
  setFilter,
  onSync,
  isSyncing = false,
  totalPending = 0,
  totalCandidates = 0,
  linkedAccountsCount = 0
}: TopFiltersProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium">Transaction Review</span>
        </div>
        <Button
          onClick={onSync}
          disabled={isSyncing || linkedAccountsCount === 0}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? 'Syncing...' : 'Sync from Bank'}
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        {/* Sort */}
        <div className="flex-1">
          <label className="text-sm font-medium mb-2 block">Sort by</label>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="amount">Amount (High to Low)</SelectItem>
              <SelectItem value="merchant">Merchant A-Z</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filter */}
        <div className="flex-1">
          <label className="text-sm font-medium mb-2 block">Filter</label>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                All Pending ({totalPending})
              </SelectItem>
              <SelectItem value="candidates">
                Likely Medical ({totalCandidates})
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary badges */}
      <div className="flex gap-2 flex-wrap">
        {linkedAccountsCount === 0 && (
          <Badge variant="outline" className="text-amber-600 border-amber-200">
            No linked accounts - link an account in Profile to sync
          </Badge>
        )}
        {totalPending > 0 && (
          <Badge variant="outline">
            {totalPending} pending review
          </Badge>
        )}
        {totalCandidates > 0 && (
          <Badge variant="default" className="bg-blue-100 text-blue-800">
            {totalCandidates} medical candidates
          </Badge>
        )}
      </div>
    </div>
  );
}