import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { ResourceFilters, US_STATES } from "@/types/resources";

interface AppliedChipsProps {
  filters: ResourceFilters;
  universities: Array<{ id: string; name: string }>;
  onRemoveState: () => void;
  onRemoveCounty: (county: string) => void;
  onRemoveUniversity: (id: string) => void;
  onRemoveCategory: (category: string) => void;
  onRemoveSearch: () => void;
  onClearAll: () => void;
}

const AppliedChips: React.FC<AppliedChipsProps> = ({
  filters,
  universities,
  onRemoveState,
  onRemoveCounty,
  onRemoveUniversity,
  onRemoveCategory,
  onRemoveSearch,
  onClearAll,
}) => {
  const hasFilters =
    filters.q ||
    filters.state ||
    filters.counties.length > 0 ||
    filters.universities.length > 0 ||
    filters.categories.length > 0;

  if (!hasFilters) return null;

  const getStateName = (code: string) => {
    return US_STATES.find((s) => s.code === code)?.name || code;
  };

  const getUniversityName = (id: string) => {
    return universities.find((u) => u.id === id)?.name || id;
  };

  return (
    <div className="flex flex-wrap items-center gap-2 p-4 bg-muted/30 rounded-lg">
      <span className="text-sm font-medium text-muted-foreground">
        Filters:
      </span>

      {filters.q && (
        <Badge variant="secondary" className="gap-1 pr-1">
          Search: {filters.q}
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemoveSearch}
            className="h-4 w-4 p-0 hover:bg-transparent"
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      )}

      {filters.state && (
        <Badge variant="secondary" className="gap-1 pr-1">
          State: {getStateName(filters.state)}
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemoveState}
            className="h-4 w-4 p-0 hover:bg-transparent"
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      )}

      {filters.counties.map((county) => (
        <Badge key={county} variant="secondary" className="gap-1 pr-1">
          {county}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemoveCounty(county)}
            className="h-4 w-4 p-0 hover:bg-transparent"
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      ))}

      {filters.universities.map((id) => (
        <Badge key={id} variant="secondary" className="gap-1 pr-1">
          {getUniversityName(id)}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemoveUniversity(id)}
            className="h-4 w-4 p-0 hover:bg-transparent"
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      ))}

      {filters.categories.map((category) => (
        <Badge key={category} variant="secondary" className="gap-1 pr-1">
          {category}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemoveCategory(category)}
            className="h-4 w-4 p-0 hover:bg-transparent"
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      ))}

      <Button
        variant="ghost"
        size="sm"
        onClick={onClearAll}
        className="ml-auto text-xs"
      >
        Clear all
      </Button>
    </div>
  );
};

export default AppliedChips;
