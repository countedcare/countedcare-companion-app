import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Search, SlidersHorizontal, AlertCircle, Plus, BookOpen } from "lucide-react";
import { useResourceFilters } from "@/hooks/useResourceFilters";
import { fetchResources, fetchUniversities } from "@/lib/queryResources";
import { ResourceItem, University } from "@/types/resources";
import ResourceCard from "@/components/resources/ResourceCard";
import FiltersPanel from "@/components/resources/FiltersPanel";
import AppliedChips from "@/components/resources/AppliedChips";
import { Skeleton } from "@/components/ui/skeleton";
import { useResourcesSystem } from "@/hooks/useResourcesSystem";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Layout from "@/components/Layout";
import SuggestResourceModal from "@/components/resources/SuggestResourceModal";
import { Link } from "react-router-dom";

const Resources: React.FC = () => {
  const { user } = useAuth();
  const {
    filters,
    rawFilters,
    setQ,
    setState,
    toggleCounty,
    toggleUniversity,
    toggleCategory,
    setSort,
    setPage,
    resetFilters,
  } = useResourceFilters();

  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [universities, setUniversities] = useState<University[]>([]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [showSuggestModal, setShowSuggestModal] = useState(false);

  const { toggleBookmark, isBookmarked, suggestResource, logResourceEvent } = useResourcesSystem();

  // Load universities for chip display
  useEffect(() => {
    fetchUniversities().then(setUniversities);
  }, []);

  // Fetch resources when filters change
  useEffect(() => {
    const loadResources = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchResources(filters);
        setResources(result.items);
        setTotalCount(result.count);
        setHasMore(result.hasMore);
      } catch (err) {
        console.error("Error loading resources:", err);
        setError("Failed to load resources. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadResources();
  }, [filters]);

  const handleToggleBookmark = (resourceId: string) => {
    toggleBookmark(resourceId);
    // Update local state optimistically
    setResources((prev) =>
      prev.map((r) =>
        r.id === resourceId
          ? { ...r, is_bookmarked: !r.is_bookmarked }
          : r
      )
    );
  };

  const handleViewDetails = (resourceId: string) => {
    logResourceEvent(resourceId, 'view', { from: 'list' });
    window.location.href = `/resources/${resourceId}`;
  };

  const hasActiveFilters =
    filters.q ||
    filters.state ||
    filters.counties.length > 0 ||
    filters.universities.length > 0 ||
    filters.categories.length > 0;

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b bg-card">
          <div className="container mx-auto px-4 py-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold">Resources & Programs</h1>
                  <p className="text-muted-foreground">
                    Find programs, benefits, and support services
                  </p>
                </div>
                <div className="hidden lg:flex gap-2">
                  <Link to="/resources/saved">
                    <Button variant="outline" size="sm">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Saved
                    </Button>
                  </Link>
                  <Button size="sm" onClick={() => setShowSuggestModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Suggest
                  </Button>
                </div>
              </div>

              {/* IRS Publication Alert */}
              <Alert className="bg-green-50 border-green-200">
                <AlertCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-sm text-green-800">
                  <a
                    href="https://www.irs.gov/pub/irs-pdf/p502.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline font-medium"
                  >
                    IRS Publication 502
                  </a>{" "}
                  - Official guide on medical and dental expenses
                </AlertDescription>
              </Alert>

              {/* Search and Controls */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={rawFilters.q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search programs, benefits, or keywords…"
                    className="pl-10 h-12"
                  />
                </div>

                {/* Sort */}
                <Select value={filters.sort} onValueChange={(v: any) => setSort(v)}>
                  <SelectTrigger className="w-full sm:w-40 h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recommended">Recommended</SelectItem>
                    <SelectItem value="az">A-Z</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                  </SelectContent>
                </Select>

                {/* Mobile Filters Button */}
                <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="lg:hidden h-12">
                      <SlidersHorizontal className="h-4 w-4 mr-2" />
                      Filters
                      {hasActiveFilters && (
                        <span className="ml-2 px-2 py-0.5 bg-primary text-primary-foreground rounded-full text-xs">
                          {Object.values(filters).filter(v => v && (Array.isArray(v) ? v.length : true)).length}
                        </span>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="h-[80vh]">
                    <div className="py-4">
                      <h2 className="text-lg font-semibold mb-4">Filters</h2>
                      <FiltersPanel
                        filters={filters}
                        onStateChange={setState}
                        onCountyToggle={toggleCounty}
                        onUniversityToggle={toggleUniversity}
                        onCategoryToggle={toggleCategory}
                        onReset={resetFilters}
                        onApply={() => setMobileFiltersOpen(false)}
                        isMobile
                      />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Desktop Sidebar Filters */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-6 bg-card border rounded-lg p-4">
                <h2 className="text-lg font-semibold mb-4">Filters</h2>
                <FiltersPanel
                  filters={filters}
                  onStateChange={setState}
                  onCountyToggle={toggleCounty}
                  onUniversityToggle={toggleUniversity}
                  onCategoryToggle={toggleCategory}
                  onReset={resetFilters}
                />
              </div>
            </aside>

            {/* Results */}
            <main className="flex-1 min-w-0">
              {/* Applied Chips */}
              {hasActiveFilters && (
                <div className="mb-4">
                  <AppliedChips
                    filters={filters}
                    universities={universities}
                    onRemoveState={() => setState(null)}
                    onRemoveCounty={toggleCounty}
                    onRemoveUniversity={toggleUniversity}
                    onRemoveCategory={toggleCategory}
                    onRemoveSearch={() => setQ("")}
                    onClearAll={resetFilters}
                  />
                </div>
              )}

              {/* Results Count */}
              {!loading && (
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-muted-foreground">
                    {totalCount} {totalCount === 1 ? "resource" : "resources"} found
                  </p>
                </div>
              )}

              {/* Error State */}
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Loading State */}
              {loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-64 rounded-lg" />
                  ))}
                </div>
              )}

              {/* Empty State */}
              {!loading && !error && resources.length === 0 && (
                <div className="text-center py-12 bg-muted/30 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">No resources found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your filters or search terms
                  </p>
                  <Button onClick={resetFilters} variant="outline">
                    Clear all filters
                  </Button>
                </div>
              )}

              {/* Resources Grid */}
              {!loading && !error && resources.length > 0 && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {resources.map((resource) => (
                      <ResourceCard
                        key={resource.id}
                        resource={{
                          ...resource,
                          is_bookmarked: isBookmarked(resource.id),
                        }}
                        onToggleBookmark={handleToggleBookmark}
                        onViewDetails={handleViewDetails}
                      />
                    ))}
                  </div>

                  {/* Pagination */}
                  {hasMore && (
                    <div className="mt-6 text-center">
                      <Button
                        onClick={() => setPage(filters.page + 1)}
                        variant="outline"
                      >
                        Load more
                      </Button>
                    </div>
                  )}
                </>
              )}

              {/* Disclaimer */}
              <div className="mt-12 pt-8 border-t">
                <p className="text-sm text-muted-foreground text-center max-w-3xl mx-auto">
                  This information is for educational purposes only and does not constitute legal or tax advice.
                  Please consult a qualified professional for advice specific to your situation.
                </p>
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* Suggest Resource Modal */}
      <SuggestResourceModal
        isOpen={showSuggestModal}
        onClose={() => setShowSuggestModal(false)}
        onSubmit={suggestResource}
      />
    </Layout>
  );
};

export default Resources;
