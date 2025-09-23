import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Heart, ExternalLink, Bookmark } from 'lucide-react';
import Layout from '@/components/Layout';
import { useSupabaseResources } from '@/hooks/useSupabaseResources';
import { useSupabaseSavedResources } from '@/hooks/useSupabaseSavedResources';
import { toast } from 'sonner';

const Resources = () => {
  const navigate = useNavigate();
  const { resources, loading } = useSupabaseResources();
  const { saveResource, unsaveResource, isResourceSaved } = useSupabaseSavedResources();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // Filter resources based on search and active tab
  const filteredResources = resources.filter(resource => {
    const matchesSearch = !searchTerm || 
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = activeTab === 'all'
      ? true
      : resource.category === activeTab;
    
    return matchesSearch && matchesTab;
  });

  const handleSaveToggle = async (resourceId: string) => {
    try {
      if (isResourceSaved(resourceId)) {
        await unsaveResource(resourceId);
        toast.success('Resource removed from saved');
      } else {
        await saveResource(resourceId);
        toast.success('Resource saved');
      }
    } catch (err) {
      toast.error('Failed to update saved status');
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-heading">Resources</h1>
          <Button
            variant="outline"
            onClick={() => navigate('/resources/saved')}
            className="flex items-center gap-2"
          >
            <Bookmark className="h-4 w-4" />
            Saved
          </Button>
        </div>
        
        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input 
            placeholder="Search resources..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* Resource Tabs */}
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="Federal">Federal</TabsTrigger>
            <TabsTrigger value="California">California</TabsTrigger>
            <TabsTrigger value="Los Angeles County">LA County</TabsTrigger>
            <TabsTrigger value="Nonprofit">Nonprofit</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-6">
            <div className="space-y-4">
              {filteredResources.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No resources found matching your criteria.</p>
                </div>
              )}
              
              {filteredResources.map((resource) => (
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
                            handleSaveToggle(resource.id);
                          }}
                          className={`${isResourceSaved(resource.id) ? 'text-red-600' : 'text-gray-400 hover:text-red-600'}`}
                        >
                          <Heart className={`h-4 w-4 ${isResourceSaved(resource.id) ? 'fill-current' : ''}`} />
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
                    <CardDescription>{resource.description}</CardDescription>
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
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Resources;