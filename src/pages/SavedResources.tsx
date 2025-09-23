import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, ExternalLink, ArrowLeft, BookOpen } from 'lucide-react';
import Layout from '@/components/Layout';
import { useSupabaseSavedResources } from '@/hooks/useSupabaseSavedResources';
import { toast } from 'sonner';

const SavedResources = () => {
  const navigate = useNavigate();
  const { savedResources, loading, unsaveResource } = useSupabaseSavedResources();

  const handleUnsaveResource = async (resourceId: string) => {
    try {
      await unsaveResource(resourceId);
      toast.success('Resource removed from saved');
    } catch (err) {
      toast.error('Failed to remove resource');
    }
  };

  const handleResourceClick = (resourceId: string) => {
    navigate(`/resources/${resourceId}`);
  };

  if (loading) {
    return (
      <Layout>
        <div className="container-padding py-6 flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-padding py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/resources')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-heading">Saved Resources</h1>
        </div>

        {/* Empty State */}
        {savedResources.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-600 mb-2">No saved resources yet</h2>
            <p className="text-gray-500 mb-6">Tap ★ on any program to save it here.</p>
            <Button onClick={() => navigate('/resources')}>
              Browse Resources
            </Button>
          </div>
        )}

        {/* Saved Resources List */}
        <div className="space-y-4">
          {savedResources.map(({ resource }) => (
            <Card key={resource.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex-1" onClick={() => handleResourceClick(resource.id)}>
                    <CardTitle className="text-lg hover:text-primary transition-colors">
                      {resource.title}
                    </CardTitle>
                    <div className="flex flex-wrap gap-1 mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {resource.category}
                      </Badge>
                      {resource.tags?.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex space-x-1 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUnsaveResource(resource.id);
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Heart className="h-4 w-4 fill-current" />
                    </Button>
                    {(resource.url || resource.external_links?.source_url) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          const url = resource.external_links?.source_url || resource.url;
                          window.open(url, '_blank');
                        }}
                        className="flex items-center"
                      >
                        Visit <ExternalLink className="ml-1 h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent onClick={() => handleResourceClick(resource.id)}>
                <p className="text-gray-600 text-sm line-clamp-2">{resource.description}</p>
                {resource.estimated_benefit && (
                  <div className="mt-2">
                    <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                      💰 {resource.estimated_benefit}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default SavedResources;