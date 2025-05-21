
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Heart, ExternalLink, Landmark, MapPin } from 'lucide-react';
import Layout from '@/components/Layout';
import useLocalStorage from '@/hooks/useLocalStorage';
import { Resource, User } from '@/types/User';

// Updated resources data with location categories and ZIP code regions
const defaultResources: Resource[] = [
  {
    id: 'res-1',
    title: 'IRS Publication 502: Medical and Dental Expenses',
    category: 'federal',
    description: 'Official IRS guide to medical expense deductions, including qualifying expenses and calculation methods.',
    link: 'https://www.irs.gov/publications/p502',
    isFavorite: false,
    zipRegions: ['all'] // Available nationwide
  },
  {
    id: 'res-2',
    title: 'Medicare Extra Help Program',
    category: 'federal',
    description: 'Information about Medicare\'s Extra Help program for prescription drug costs.',
    link: 'https://www.ssa.gov/benefits/medicare/prescriptionhelp.html',
    isFavorite: false,
    zipRegions: ['all'] // Available nationwide
  },
  {
    id: 'res-3',
    title: 'State Tax Credits for Caregivers - California',
    category: 'state',
    description: 'Learn about available tax credits specifically for family caregivers in California.',
    link: 'https://www.aarp.org/caregiving/financial-legal/info-2020/tax-tips-family-caregivers.html',
    isFavorite: false,
    zipRegions: ['9'] // California ZIP codes start with 9
  },
  {
    id: 'res-4',
    title: 'County Health Department Resources - Los Angeles',
    category: 'county',
    description: 'Los Angeles county health department resources for caregivers and their care recipients.',
    link: 'https://www.naccho.org/membership/lhd-directory',
    isFavorite: false,
    zipRegions: ['900', '901', '902', '903', '904', '905'] // Los Angeles area ZIP codes
  },
  {
    id: 'res-5',
    title: 'Local Caregiver Support Groups - San Francisco',
    category: 'local',
    description: 'Find local support groups for caregivers to share experiences and advice in San Francisco.',
    link: 'https://www.caregiver.org/connecting-caregivers/support-groups/',
    isFavorite: false,
    zipRegions: ['941'] // San Francisco area ZIP codes
  },
  {
    id: 'res-6',
    title: 'State Tax Credits for Caregivers - New York',
    category: 'state',
    description: 'Learn about available tax credits specifically for family caregivers in New York.',
    link: 'https://www.aarp.org/caregiving/financial-legal/info-2020/tax-tips-family-caregivers.html',
    isFavorite: false,
    zipRegions: ['1'] // New York ZIP codes start with 1
  },
  {
    id: 'res-7',
    title: 'Local Caregiver Support Groups - New York City',
    category: 'local',
    description: 'Find local support groups for caregivers to share experiences and advice in NYC.',
    link: 'https://www.caregiver.org/connecting-caregivers/support-groups/',
    isFavorite: false,
    zipRegions: ['100', '101', '102'] // NYC area ZIP codes
  }
];

const Resources = () => {
  const [resources, setResources] = useLocalStorage<Resource[]>('countedcare-resources', defaultResources);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('federal');
  const [user] = useLocalStorage<User>('countedcare-user', {
    name: '',
    email: '',
    isCaregiver: true,
    caregivingFor: [],
    onboardingComplete: false,
    zipCode: ''
  });
  
  // Added state for location filter inputs
  const [locationFilter, setLocationFilter] = useState({
    city: '',
    zipCode: user.zipCode || ''
  });
  
  // Update location filter when user.zipCode changes
  useEffect(() => {
    if (user.zipCode) {
      setLocationFilter(prev => ({...prev, zipCode: user.zipCode}));
    }
  }, [user.zipCode]);
  
  // Function to check if a resource is relevant to the user's ZIP code
  const isResourceRelevantToZip = (resource: Resource, zipCode: string): boolean => {
    // Federal resources are available everywhere
    if (resource.category === 'federal') return true;
    
    // If no zipRegions defined or user has no ZIP code, show everything
    if (!resource.zipRegions || !zipCode) return true;
    
    // For "all" region, show regardless of ZIP
    if (resource.zipRegions.includes('all')) return true;
    
    // Check if any prefix of the ZIP code matches the resource's zipRegions
    // Start with most specific (e.g., "90210", then "9021", "902", "90", "9")
    for (let i = zipCode.length; i > 0; i--) {
      const prefix = zipCode.substring(0, i);
      if (resource.zipRegions.includes(prefix)) {
        return true;
      }
    }
    
    return false;
  };
  
  // Filter resources based on search, active tab, user's ZIP code, and city
  const filteredResources = resources.filter(resource => {
    const matchesSearch = !searchTerm || 
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = activeTab === 'favorites' 
      ? resource.isFavorite 
      : activeTab === 'all'
      ? true
      : resource.category === activeTab;
    
    // Filter by ZIP code if provided in the location filter
    const matchesZipCode = locationFilter.zipCode ? 
      isResourceRelevantToZip(resource, locationFilter.zipCode) : 
      true;
    
    // Simple city filter - check if resource description or title contains the city name
    // In a real app, you might want a more sophisticated matching system
    const matchesCity = !locationFilter.city || 
      resource.title.toLowerCase().includes(locationFilter.city.toLowerCase()) ||
      resource.description.toLowerCase().includes(locationFilter.city.toLowerCase());
    
    return matchesSearch && matchesTab && matchesZipCode && matchesCity;
  });
  
  const toggleFavorite = (id: string) => {
    setResources(resources.map(resource =>
      resource.id === id ? { ...resource, isFavorite: !resource.isFavorite } : resource
    ));
  };
  
  const handleLocationFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLocationFilter(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const clearLocationFilters = () => {
    setLocationFilter({
      city: '',
      zipCode: ''
    });
  };
  
  return (
    <Layout>
      <div className="container-padding py-6">
        <h1 className="text-2xl font-heading mb-6">Resources</h1>
        
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
        
        {/* Location Filter Section */}
        <div className="mb-6 bg-gray-50 p-4 rounded-md">
          <h3 className="text-sm font-medium mb-3 flex items-center">
            <MapPin className="h-4 w-4 mr-1" />
            Filter by Location
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label htmlFor="city" className="text-sm text-gray-600 block mb-1">City</label>
              <Input
                id="city"
                name="city"
                placeholder="Enter city"
                value={locationFilter.city}
                onChange={handleLocationFilterChange}
              />
            </div>
            <div>
              <label htmlFor="zipCode" className="text-sm text-gray-600 block mb-1">ZIP Code</label>
              <Input
                id="zipCode"
                name="zipCode"
                placeholder="Enter ZIP code"
                value={locationFilter.zipCode}
                onChange={handleLocationFilterChange}
              />
            </div>
          </div>
          <div className="mt-3 flex justify-end">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearLocationFilters}
              className="text-xs"
            >
              Clear Filters
            </Button>
          </div>
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
                {searchTerm || locationFilter.city || locationFilter.zipCode
                  ? 'No resources match your search criteria'
                  : `No ${activeTab} resources found`
                }
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Resources;
