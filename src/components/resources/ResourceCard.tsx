import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, ExternalLink, DollarSign, MapPin, Tag } from 'lucide-react';
import { Resource } from '@/hooks/useResourcesSystem';

interface ResourceCardProps {
  resource: Resource;
  onToggleBookmark: (resourceId: string) => void;
  onViewDetails: (resourceId: string) => void;
  showLocationInfo?: boolean;
}

const ResourceCard: React.FC<ResourceCardProps> = ({ 
  resource, 
  onToggleBookmark, 
  onViewDetails,
  showLocationInfo = true
}) => {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'federal': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'state': return 'bg-green-100 text-green-800 border-green-200';
      case 'county': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'nonprofit': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'federal': return 'Federal';
      case 'state': return resource.state_code || 'State';
      case 'county': return resource.county_name || 'County';
      case 'nonprofit': return 'Nonprofit';
      default: return category;
    }
  };

  const formatBenefitRange = () => {
    if (resource.estimated_benefit_min && resource.estimated_benefit_max) {
      return `$${resource.estimated_benefit_min.toLocaleString()} - $${resource.estimated_benefit_max.toLocaleString()}`;
    } else if (resource.estimated_benefit_min) {
      return `From $${resource.estimated_benefit_min.toLocaleString()}`;
    } else if (resource.estimated_benefit_max) {
      return `Up to $${resource.estimated_benefit_max.toLocaleString()}`;
    }
    return null;
  };

  return (
    <Card className="h-full hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge 
                variant="secondary" 
                className={getCategoryColor(resource.category)}
              >
                {getCategoryLabel(resource.category)}
              </Badge>
              
              {showLocationInfo && resource.county_name && (
                <Badge variant="outline" className="text-xs">
                  <MapPin className="w-3 h-3 mr-1" />
                  {resource.county_name}
                </Badge>
              )}
            </div>
            
            <CardTitle className="text-lg font-semibold leading-tight mb-2">
              {resource.title}
            </CardTitle>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleBookmark(resource.id)}
            className={`flex-shrink-0 ${
              resource.is_bookmarked 
                ? 'text-red-600 hover:text-red-700' 
                : 'text-gray-400 hover:text-red-600'
            }`}
            title={resource.is_bookmarked ? 'Remove from saved' : 'Save for later'}
          >
            <Heart 
              className={`h-5 w-5 ${resource.is_bookmarked ? 'fill-current' : ''}`} 
            />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <CardDescription className="text-sm text-gray-600 mb-4 line-clamp-3">
          {resource.description}
        </CardDescription>

        {/* Benefits */}
        {formatBenefitRange() && (
          <div className="flex items-center gap-2 mb-3 text-sm text-green-700">
            <DollarSign className="h-4 w-4" />
            <span className="font-medium">{formatBenefitRange()}</span>
          </div>
        )}

        {/* Tags */}
        {resource.tags && resource.tags.length > 0 && (
          <div className="flex items-start gap-1 mb-4">
            <Tag className="h-3 w-3 mt-1 text-gray-400 flex-shrink-0" />
            <div className="flex flex-wrap gap-1">
              {resource.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {resource.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{resource.tags.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            onClick={() => onViewDetails(resource.id)}
            className="flex-1"
            size="sm"
          >
            View Details
            <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
          
          {resource.apply_url && (
            <Button 
              variant="outline"
              size="sm"
              onClick={() => window.open(resource.apply_url, '_blank')}
              className="flex-1"
            >
              Apply Now
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ResourceCard;