import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Heart, Star } from 'lucide-react';
import Layout from '@/components/Layout';
import { useResourcesSystem, ResourceCategory } from '@/hooks/useResourcesSystem';
import { useAuth } from '@/contexts/AuthContext';
import ResourceCard from '@/components/resources/ResourceCard';
import ResourceFilters from '@/components/resources/ResourceFilters';
import ResourceSearchBar from '@/components/resources/ResourceSearchBar';

interface SavedResourceFilters {
  category?: ResourceCategory;
  state?: string;
  county?: string;
  tags?: string[];
}

const SavedResources = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    bookmarkedResources,
    bookmarksLoading,
    getBookmarkedResources,
    toggleBookmark,
    logResourceEvent
  } = useResourcesSystem();

  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SavedResourceFilters>({});
  const [sortBy, setSortBy] = useState('recommended');

  useEffect(() => {
    if (user) {
      getBookmarkedResources();
    }
  }, [user, getBookmarkedResources]);

  // Filter saved resources based on search and filters
  const filteredResources = React.useMemo(() => {
    let filtered = [...bookmarkedResources];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(resource =>
        resource.title.toLowerCase().includes(query) ||
        resource.description.toLowerCase().includes(query) ||
        resource.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(resource => resource.category === filters.category);
    }

    // State filter
    if (filters.state) {
      filtered = filtered.filter(resource => resource.state_code === filters.state);
    }

    // County filter  
    if (filters.county) {
      filtered = filtered.filter(resource => resource.county_name === filters.county);
    }

    // Sort
    switch (sortBy) {
      case 'az':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'newest':
        filtered.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
      case 'savings':
        filtered.sort((a, b) => {
          const aMax = a.estimated_benefit_max || 0;
          const bMax = b.estimated_benefit_max || 0;
          return bMax - aMax;
        });
        break;
      default:
        // Keep original order (most recently saved first)
        break;
    }

    return filtered;
  }, [bookmarkedResources, searchQuery, filters, sortBy]);

  const handleViewDetails = (resourceId: string) => {
    logResourceEvent(resourceId, 'view', { from: 'saved' });
    navigate(`/resources/${resourceId}`);
  };

  if (!user) {
    return (
      <Layout>
        <div className="container-padding py-6">
          <div className="text-center py-12">
            <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Sign in to save resources</h2>
            <p className="text-gray-600 mb-6">
              Create an account to bookmark helpful programs and benefits.
            </p>
            <Link to="/auth">
              <Button>Sign In</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-padding py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link to="/resources">
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Resources
            </Button>
          </Link>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">Saved Resources</h1>
          <p className="text-gray-600">
            Programs and benefits you've saved for later
          </p>
        </div>

        {/* Loading State */}
        {bookmarksLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-lg h-48"></div>
              </div>
            ))}
          </div>
        )}

        {/* Content */}
        {!bookmarksLoading && (
          <>
            {bookmarkedResources.length === 0 ? (
              /* Empty State */
              <div className="text-center py-16">
                <div className="max-w-md mx-auto">
                  <Star className="h-16 w-16 text-gray-300 mx-auto mb-6" />
                  <h2 className="text-xl font-semibold mb-2 text-gray-700">
                    No saved resources yet
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Tap ★ on any program to save it here.
                  </p>
                  <Link to="/resources">
                    <Button>Browse Resources</Button>
                  </Link>
                </div>
              </div>
            ) : (
              <>
                {/* Search and Filters */}
                <div className="space-y-6 mb-8">
                  <ResourceSearchBar
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="Search your saved resources..."
                  />
                  
                  <ResourceFilters
                    filters={filters}
                    onFiltersChange={setFilters}
                    sortBy={sortBy}
                    onSortChange={setSortBy}
                  />
                </div>

                {/* Filtered Results Count */}
                {(searchQuery || Object.keys(filters).length > 0) && (
                  <div className="mb-6">
                    <p className="text-sm text-gray-600">
                      Showing {filteredResources.length} of {bookmarkedResources.length} saved resources
                    </p>
                  </div>
                )}

                {/* Resources Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredResources.map((resource) => (
                    <ResourceCard
                      key={resource.id}
                      resource={resource}
                      onToggleBookmark={toggleBookmark}
                      onViewDetails={handleViewDetails}
                    />
                  ))}
                </div>

                {/* No Results After Filtering */}
                {filteredResources.length === 0 && bookmarkedResources.length > 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500 mb-4">
                      No saved resources match your current search and filters.
                    </p>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setSearchQuery('');
                        setFilters({});
                      }}
                    >
                      Clear filters
                    </Button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default SavedResources;
