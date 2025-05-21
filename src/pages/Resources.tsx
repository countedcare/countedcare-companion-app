
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Heart, ExternalLink, Landmark } from 'lucide-react';
import Layout from '@/components/Layout';
import useLocalStorage from '@/hooks/useLocalStorage';
import { Resource } from '@/types/User';

// Updated resources data with location categories
const defaultResources: Resource[] = [
  {
    id: 'res-1',
    title: 'IRS Publication 502: Medical and Dental Expenses',
    category: 'federal',
    description: 'Official IRS guide to medical expense deductions, including qualifying expenses and calculation methods.',
    link: 'https://www.irs.gov/publications/p502',
    isFavorite: false
  },
  {
    id: 'res-2',
    title: 'Medicare Extra Help Program',
    category: 'federal',
    description: 'Information about Medicare\'s Extra Help program for prescription drug costs.',
    link: 'https://www.ssa.gov/benefits/medicare/prescriptionhelp.html',
    isFavorite: false
  },
  {
    id: 'res-3',
    title: 'State Tax Credits for Caregivers',
    category: 'state',
    description: 'Learn about available tax credits specifically for family caregivers in your state.',
    link: 'https://www.aarp.org/caregiving/financial-legal/info-2020/tax-tips-family-caregivers.html',
    isFavorite: false
  },
  {
    id: 'res-4',
    title: 'County Health Department Resources',
    category: 'county',
    description: 'Local county health department resources for caregivers and their care recipients.',
    link: 'https://www.naccho.org/membership/lhd-directory',
    isFavorite: false
  },
  {
    id: 'res-5',
    title: 'Local Caregiver Support Groups',
    category: 'local',
    description: 'Find local support groups for caregivers to share experiences and advice.',
    link: 'https://www.caregiver.org/connecting-caregivers/support-groups/',
    isFavorite: false
  }
];

const Resources = () => {
  const [resources, setResources] = useLocalStorage<Resource[]>('countedcare-resources', defaultResources);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('federal');
  
  // Filter resources based on search and active tab
  const filteredResources = resources.filter(resource => {
    const matchesSearch = !searchTerm || 
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = activeTab === 'favorites' 
      ? resource.isFavorite 
      : activeTab === 'all'
      ? true
      : resource.category === activeTab;
    
    return matchesSearch && matchesTab;
  });
  
  const toggleFavorite = (id: string) => {
    setResources(resources.map(resource =>
      resource.id === id ? { ...resource, isFavorite: !resource.isFavorite } : resource
    ));
  };
  
  return (
    <Layout>
      <div className="container-padding py-6">
        <h1 className="text-2xl font-heading mb-6">Resources</h1>
        
        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input 
            placeholder="Search resources..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* Resource Tabs */}
        <Tabs defaultValue="federal" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 mb-6">
            <TabsTrigger value="federal">Federal</TabsTrigger>
            <TabsTrigger value="state">State</TabsTrigger>
            <TabsTrigger value="county">County</TabsTrigger>
            <TabsTrigger value="local">Local</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-0">
            {filteredResources.length > 0 ? (
              <div className="space-y-4">
                {filteredResources.map((resource) => (
                  <Card key={resource.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between">
                        <div>
                          <CardTitle className="text-lg">{resource.title}</CardTitle>
                          <CardDescription className="mt-1">
                            <Badge variant={
                              resource.category === 'federal' ? 'default' :
                              resource.category === 'state' ? 'secondary' :
                              resource.category === 'county' ? 'outline' :
                              'destructive'
                            } 
                            className={
                              resource.category === 'federal' ? 'bg-blue-600' :
                              resource.category === 'state' ? 'bg-green-600' :
                              resource.category === 'county' ? 'border-orange-500 text-orange-500' :
                              'bg-red-600'
                            }>
                              <Landmark className="h-3 w-3 mr-1" />
                              {resource.category.charAt(0).toUpperCase() + resource.category.slice(1)}
                            </Badge>
                          </CardDescription>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleFavorite(resource.id)}
                          className={resource.isFavorite ? 'text-red-500' : 'text-gray-400'}
                        >
                          <Heart className="h-5 w-5" fill={resource.isFavorite ? 'currentColor' : 'none'} />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 mb-4">
                        {resource.description}
                      </p>
                      {resource.link && (
                        <a 
                          href={resource.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center text-primary hover:text-primary-dark font-medium"
                        >
                          View Resource
                          <ExternalLink className="ml-1 h-4 w-4" />
                        </a>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                {searchTerm ? 'No resources match your search' : 'No resources in this category'}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Resources;
