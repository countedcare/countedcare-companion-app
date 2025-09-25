import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, BookOpen, Info, FileText, ExternalLink } from 'lucide-react';
import Layout from '@/components/Layout';
import { useResourcesSystem, ResourceCategory } from '@/hooks/useResourcesSystem';
import { useAuth } from '@/contexts/AuthContext';
import ResourceCard from '@/components/resources/ResourceCard';
import ResourceFilters from '@/components/resources/ResourceFilters';
import ResourceSearchBar from '@/components/resources/ResourceSearchBar';
import SuggestResourceModal from '@/components/resources/SuggestResourceModal';

interface Filters {
  category?: ResourceCategory;
  state?: string;
  county?: string;
  tags?: string[];
}

const Resources = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    resources,
    loading,
    error,
    searchResources,
    toggleBookmark,
    logResourceEvent,
    suggestResource
  } = useResourcesSystem();

  // UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Filters>({});
  const [sortBy, setSortBy] = useState('recommended');
  const [showSuggestModal, setShowSuggestModal] = useState(false);

  // Search and filter logic
  useEffect(() => {
    const searchFilters = {
      query: searchQuery || undefined,
      ...filters
    };
    
    searchResources(searchFilters);
  }, [searchQuery, filters, searchResources]);

  // Default to California/LA County for new users
  useEffect(() => {
    if (user && Object.keys(filters).length === 0) {
      setFilters({
        state: 'CA',
        county: 'Los Angeles'
      });
    }
  }, [user, filters]);

  // Sort resources
  const sortedResources = React.useMemo(() => {
    const resourcesCopy = [...resources];
    
    switch (sortBy) {
      case 'az':
        return resourcesCopy.sort((a, b) => a.title.localeCompare(b.title));
      case 'newest':
        return resourcesCopy.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      case 'savings':
        return resourcesCopy.sort((a, b) => {
          const aMax = a.estimated_benefit_max || 0;
          const bMax = b.estimated_benefit_max || 0;
          return bMax - aMax;
        });
      default: // recommended
        return resourcesCopy; // Already sorted by rank from search function
    }
  }, [resources, sortBy]);

  const handleViewDetails = (resourceId: string) => {
    logResourceEvent(resourceId, 'view', { from: 'list' });
    navigate(`/resources/${resourceId}`);
  };

  if (loading) {
    return (
      <Layout>
        <div className="container-padding py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-lg h-48"></div>
              </div>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-padding py-6" data-tour="resources-content">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-1">Resources & Programs</h1>
            <p className="text-gray-600">Discover programs that can help reduce caregiving costs</p>
          </div>
          <div className="flex gap-2">
            <Link to="/resources/saved">
              <Button variant="outline" size="sm">
                <BookOpen className="h-4 w-4 mr-2" />
                Saved Resources
              </Button>
            </Link>
            <Button size="sm" onClick={() => setShowSuggestModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Suggest Resource
            </Button>
          </div>
        </div>

        {/* IRS Publication 502 Reference */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-medium text-green-900 mb-1">Official IRS Medical Expense Guide</h3>
              <p className="text-sm text-green-800 mb-3">
                Review IRS Publication 502 for the complete list of qualifying medical and dental expenses that can be deducted.
              </p>
              <a
                href="https://www.irs.gov/pub/irs-pdf/p502.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-green-700 hover:text-green-800 underline"
              >
                <FileText className="h-4 w-4" />
                View IRS Publication 502 (PDF)
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Personalization Banner */}
        {filters.state === 'CA' && filters.county === 'Los Angeles' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-blue-900 mb-1">Personalized for California (Los Angeles County)</h3>
                <p className="text-sm text-blue-800">
                  We're showing you programs available in your area. You can{' '}
                  <Link to="/profile" className="underline font-medium">
                    update your location in Profile
                  </Link>{' '}
                  or clear filters to see all programs.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <ResourceSearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          className="mb-6"
        />

        {/* Filters */}
        <ResourceFilters
          filters={filters}
          onFiltersChange={setFilters}
          sortBy={sortBy}
          onSortChange={setSortBy}
          className="mb-6"
        />

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => window.location.reload()} 
              className="mt-2"
            >
              Retry
            </Button>
          </div>
        )}

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedResources.map((resource) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              onToggleBookmark={toggleBookmark}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>

        {/* Empty State */}
        {!loading && sortedResources.length === 0 && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <p className="text-gray-500 mb-4">
                {searchQuery || Object.keys(filters).length > 0
                  ? 'No results. Try different keywords or clear filters.'
                  : 'No resources available at this time.'}
              </p>
              {(searchQuery || Object.keys(filters).length > 0) && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchQuery('');
                    setFilters({});
                  }}
                >
                  Clear all filters
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-600 text-center max-w-3xl mx-auto">
            This information is for educational purposes only and does not constitute legal or tax advice. 
            Please consult a qualified professional for advice specific to your situation.
          </p>
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