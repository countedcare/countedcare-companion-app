import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { ResourceFilters, US_STATES, University } from "@/types/resources";
import {
  fetchUniversities,
  fetchDistinctCounties,
  fetchDistinctCategories,
} from "@/lib/queryResources";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface FiltersPanelProps {
  filters: ResourceFilters;
  onStateChange: (state: string | null) => void;
  onCountyToggle: (county: string) => void;
  onUniversityToggle: (id: string) => void;
  onCategoryToggle: (category: string) => void;
  onReset: () => void;
  onApply?: () => void;
  isMobile?: boolean;
}

const FiltersPanel: React.FC<FiltersPanelProps> = ({
  filters,
  onStateChange,
  onCountyToggle,
  onUniversityToggle,
  onCategoryToggle,
  onReset,
  onApply,
  isMobile = false,
}) => {
  const [universities, setUniversities] = useState<University[]>([]);
  const [counties, setCounties] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [universitySearch, setUniversitySearch] = useState("");
  const [countySearch, setCountySearch] = useState("");
  const [uniPopoverOpen, setUniPopoverOpen] = useState(false);

  // Load universities
  useEffect(() => {
    fetchUniversities(universitySearch).then(setUniversities);
  }, [universitySearch]);

  // Load counties when state changes
  useEffect(() => {
    fetchDistinctCounties(filters.state).then(setCounties);
  }, [filters.state]);

  // Load categories on mount
  useEffect(() => {
    fetchDistinctCategories().then(setCategories);
  }, []);

  const selectedUniversities = universities.filter((u) =>
    filters.universities.includes(u.id)
  );

  const filteredCounties = counties.filter((c) =>
    c.toLowerCase().includes(countySearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* State Selection */}
      <div className="space-y-2">
        <Label htmlFor="state-select">State</Label>
        <Select value={filters.state || ""} onValueChange={onStateChange}>
          <SelectTrigger id="state-select">
            <SelectValue placeholder="Select state" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All States</SelectItem>
            {US_STATES.map((state) => (
              <SelectItem key={state.code} value={state.code}>
                {state.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* County Multi-Select */}
      <div className="space-y-2">
        <Label>Counties</Label>
        {!filters.state && (
          <p className="text-xs text-muted-foreground">
            Select a state first
          </p>
        )}
        {filters.state && (
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search counties..."
                value={countySearch}
                onChange={(e) => setCountySearch(e.target.value)}
                className="pl-8"
              />
            </div>
            <ScrollArea className="h-40 border rounded-md p-2">
              {filteredCounties.length === 0 && (
                <p className="text-sm text-muted-foreground p-2">
                  No counties found
                </p>
              )}
              {filteredCounties.map((county) => (
                <div
                  key={county}
                  className="flex items-center space-x-2 p-2 hover:bg-muted rounded"
                >
                  <Checkbox
                    id={`county-${county}`}
                    checked={filters.counties.includes(county)}
                    onCheckedChange={() => onCountyToggle(county)}
                  />
                  <label
                    htmlFor={`county-${county}`}
                    className="text-sm cursor-pointer flex-1"
                  >
                    {county}
                  </label>
                </div>
              ))}
            </ScrollArea>
          </div>
        )}
      </div>

      {/* University Multi-Select */}
      <div className="space-y-2">
        <Label>Universities</Label>
        <Popover open={uniPopoverOpen} onOpenChange={setUniPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              className="w-full justify-between"
            >
              {selectedUniversities.length > 0
                ? `${selectedUniversities.length} selected`
                : "Select universities"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <Command>
              <CommandInput
                placeholder="Search universities..."
                value={universitySearch}
                onValueChange={setUniversitySearch}
              />
              <CommandList>
                <CommandEmpty>No universities found.</CommandEmpty>
                <CommandGroup>
                  {universities.map((uni) => (
                    <CommandItem
                      key={uni.id}
                      onSelect={() => {
                        onUniversityToggle(uni.id);
                      }}
                    >
                      <Checkbox
                        checked={filters.universities.includes(uni.id)}
                        className="mr-2"
                      />
                      <span className="flex-1">
                        {uni.name}
                        {uni.state_code && (
                          <span className="text-xs text-muted-foreground ml-1">
                            ({uni.state_code})
                          </span>
                        )}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        {selectedUniversities.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {selectedUniversities.map((uni) => (
              <Badge key={uni.id} variant="secondary" className="gap-1 pr-1">
                {uni.name}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onUniversityToggle(uni.id)}
                  className="h-4 w-4 p-0 hover:bg-transparent"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Category Multi-Select */}
      <div className="space-y-2">
        <Label>Categories</Label>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Badge
              key={category}
              variant={
                filters.categories.includes(category) ? "default" : "outline"
              }
              className="cursor-pointer"
              onClick={() => onCategoryToggle(category)}
            >
              {category}
            </Badge>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t">
        <Button variant="outline" onClick={onReset} className="flex-1">
          Reset
        </Button>
        {isMobile && onApply && (
          <Button onClick={onApply} className="flex-1">
            Apply
          </Button>
        )}
      </div>
    </div>
  );
};

export default FiltersPanel;
