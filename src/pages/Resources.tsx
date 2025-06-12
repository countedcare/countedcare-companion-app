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

// Comprehensive resources data with California caregiving resources
const defaultResources: Resource[] = [
  // Federal Resources
  {
    id: 'fed-1',
    title: 'National Institute on Aging (NIA) Caregiving Toolkit',
    category: 'federal',
    description: 'Comprehensive toolkit with articles, infographics, publications, and videos on general caregiving, Alzheimer\'s caregiving, and long-distance caregiving.',
    link: 'https://www.nia.nih.gov/toolkits/caregiving',
    isFavorite: false,
    zipRegions: ['all'],
    tags: ['Healthcare Services', 'Education/Training', 'Research']
  },
  {
    id: 'fed-2',
    title: 'Administration for Community Living (ACL) - Eldercare Locator',
    category: 'federal',
    description: 'Administers the National Family Caregiver Support Program providing information, assistance, counseling, support groups, training, respite care, and supplemental services.',
    link: 'https://www.eldercare.gov',
    isFavorite: false,
    zipRegions: ['all'],
    tags: ['Direct Support', 'Care Coordination']
  },
  {
    id: 'fed-3',
    title: 'SAMHSA National Helpline',
    category: 'federal',
    description: 'Offers coping resources, mental health information, and operates a National Helpline for mental or substance use disorders. Call 1-800-662-HELP (4357).',
    link: 'https://www.samhsa.gov/find-help/national-helpline',
    isFavorite: false,
    zipRegions: ['all'],
    tags: ['Mental Health', 'Direct Support']
  },
  {
    id: 'fed-4',
    title: 'VA Caregiver Support Program',
    category: 'federal',
    description: 'Comprehensive support including monthly stipend, health insurance, mental health counseling, legal/financial planning, and respite care for veteran caregivers.',
    link: 'https://www.caregiver.va.gov',
    isFavorite: false,
    zipRegions: ['all'],
    tags: ['Veteran Support', 'Financial Assistance', 'Healthcare Services', 'Respite Care']
  },
  {
    id: 'fed-5',
    title: 'Medicare Caregiver Resources',
    category: 'federal',
    description: 'Medicare and Medicaid HCBS waivers allow self-directed care, enabling compensation for family caregivers. Starting 2025, Medicare covers caregiver training for dementia patients.',
    link: 'https://www.medicare.gov/caregivers',
    isFavorite: false,
    zipRegions: ['all'],
    tags: ['Financial Assistance', 'Healthcare Services']
  },
  {
    id: 'fed-6',
    title: 'IRS Caregiver Tax Benefits',
    category: 'federal',
    description: 'Child and Dependent Care Credit (up to $6,000 for two or more dependents in 2024) and Credit for Other Dependents (up to $500 per dependent).',
    link: 'https://www.irs.gov/publications/p502',
    isFavorite: false,
    zipRegions: ['all'],
    tags: ['Financial Assistance']
  },
  {
    id: 'fed-7',
    title: 'Family and Medical Leave Act (FMLA)',
    category: 'federal',
    description: 'Up to 12 workweeks of unpaid, job-protected leave for family caregiving (or 26 weeks for military caregiver leave) with health insurance continuation.',
    link: 'https://www.dol.gov/agencies/whd/fmla',
    isFavorite: false,
    zipRegions: ['all'],
    tags: ['Employment Protection']
  },
  {
    id: 'fed-8',
    title: 'Social Security Caregiver Benefits',
    category: 'federal',
    description: 'Social Security auxiliary benefits for eligible caregivers and SSI for children with qualifying disabilities from low-income families.',
    link: 'https://www.ssa.gov',
    isFavorite: false,
    zipRegions: ['all'],
    tags: ['Financial Assistance', 'Disability Support']
  },
  {
    id: 'fed-9',
    title: 'Military OneSource Caregiver Support',
    category: 'federal',
    description: '24/7 support for military caregivers including navigation assistance, financial counseling, health coaching, and emotional support.',
    link: 'https://www.militaryonesource.mil',
    isFavorite: false,
    zipRegions: ['all'],
    tags: ['Veteran Support', 'Mental Health', 'Education/Training']
  },
  {
    id: 'fed-10',
    title: 'EEOC Caregiver Discrimination Protection',
    category: 'federal',
    description: 'Enforces federal laws preventing workplace discrimination against caregivers under ADA and Title VII protections.',
    link: 'https://www.eeoc.gov',
    isFavorite: false,
    zipRegions: ['all'],
    tags: ['Employment Protection', 'Legal Aid']
  },

  // California State Resources
  {
    id: 'ca-state-1',
    title: 'California Department of Aging (CDA)',
    category: 'state',
    description: 'Primary state agency administering programs for older adults, adults with disabilities, and family caregivers. Call 1-800-510-2020.',
    link: 'https://www.aging.ca.gov',
    isFavorite: false,
    zipRegions: ['9'],
    tags: ['Care Coordination', 'Direct Support', 'Older Adults']
  },
  {
    id: 'ca-state-2',
    title: 'California Caregiver Resource Centers (CRCs)',
    category: 'state',
    description: 'Network of 11 non-profit centers offering counseling, care planning, legal/financial consulting, respite services, and caregiver training at low or no cost.',
    link: 'https://www.caregivercalifornia.org',
    isFavorite: false,
    zipRegions: ['9'],
    tags: ['Direct Support', 'Counseling', 'Respite Care', 'Legal Aid']
  },
  {
    id: 'ca-state-3',
    title: 'In-Home Supportive Services (IHSS) Program',
    category: 'state',
    description: 'Medi-Cal program providing in-home assistance allowing family members to be paid caregivers. No asset limits as of 2024. Call 888-944-4477.',
    link: 'https://www.cdss.ca.gov/inforesources/ihss',
    isFavorite: false,
    zipRegions: ['9'],
    tags: ['Financial Assistance', 'Direct Support', 'Disability Support']
  },
  {
    id: 'ca-state-4',
    title: 'California Paid Family Leave (PFL)',
    category: 'state',
    description: 'Up to 8 weeks of partial wage replacement (60-70%, increasing to 90% in 2025) for caring for seriously ill family members.',
    link: 'https://www.edd.ca.gov/disability/paid-family-leave',
    isFavorite: false,
    zipRegions: ['9'],
    tags: ['Financial Assistance', 'Employment Protection']
  },
  {
    id: 'ca-state-5',
    title: 'California Department of Developmental Services (DDS)',
    category: 'state',
    description: 'Coordinates services for Californians with developmental disabilities through 21 Regional Centers. Call 833-421-0061.',
    link: 'https://www.dds.ca.gov',
    isFavorite: false,
    zipRegions: ['9'],
    tags: ['Disability Support', 'Care Coordination']
  },
  {
    id: 'ca-state-6',
    title: 'Medi-Cal (California Medicaid)',
    category: 'state',
    description: 'California\'s Medicaid program with various waivers providing long-term care and family caregiver compensation. Call 1-888-839-9909.',
    link: 'https://www.dhcs.ca.gov/services/medi-cal',
    isFavorite: false,
    zipRegions: ['9'],
    tags: ['Healthcare Services', 'Financial Assistance']
  },
  {
    id: 'ca-state-7',
    title: 'California Family Rights Act (CFRA)',
    category: 'state',
    description: 'Job-protected leave up to 12 weeks for caring for family members with serious health conditions. Broader protections than FMLA.',
    link: 'https://www.dir.ca.gov/dlse/cfra.htm',
    isFavorite: false,
    zipRegions: ['9'],
    tags: ['Employment Protection']
  },
  {
    id: 'ca-state-8',
    title: 'LawHelpCA',
    category: 'state',
    description: 'Legal information for caregivers on Power of Attorney, Advanced Health Directives, and Conservatorships with lookup tool for legal aid.',
    link: 'https://www.lawhelpca.org',
    isFavorite: false,
    zipRegions: ['9'],
    tags: ['Legal Aid']
  },
  {
    id: 'ca-state-9',
    title: 'California Parent & Youth Helpline',
    category: 'state',
    description: 'Trained counselors providing self-calming techniques, support systems, and connections to Parents Anonymous groups. Call 1-855-427-2736.',
    link: 'https://www.calmhsa.org/crisis-resources',
    isFavorite: false,
    zipRegions: ['9'],
    tags: ['Mental Health', 'Direct Support']
  },
  {
    id: 'ca-state-10',
    title: 'California Franchise Tax Board - Caregiver Tax Credits',
    category: 'state',
    description: 'State-level Child and Dependent Care Expenses Credit tied to federal credit amounts based on taxpayer income.',
    link: 'https://www.ftb.ca.gov',
    isFavorite: false,
    zipRegions: ['9'],
    tags: ['Financial Assistance']
  },

  // County/Regional Resources
  {
    id: 'ca-county-1',
    title: 'Area Agencies on Aging (AAAs) - California',
    category: 'county',
    description: 'Local organizations coordinating services including care management, nutrition, legal assistance, and Family Caregiver Support Program services.',
    link: 'https://www.aging.ca.gov/Find_Services_in_My_County',
    isFavorite: false,
    zipRegions: ['9'],
    tags: ['Direct Support', 'Care Coordination', 'Legal Aid', 'Respite Care']
  },
  {
    id: 'ca-county-2',
    title: 'Regional Centers - California',
    category: 'county',
    description: '21 non-profit organizations providing diagnosis, case management, and coordination of supports for individuals with developmental disabilities.',
    link: 'https://www.dds.ca.gov/rc/listings',
    isFavorite: false,
    zipRegions: ['9'],
    tags: ['Disability Support', 'Care Coordination', 'Respite Care']
  },
  {
    id: 'ca-county-3',
    title: 'County IHSS Offices - California',
    category: 'county',
    description: 'Local administration of In-Home Supportive Services program. Contact information varies by county.',
    link: 'https://www.cdss.ca.gov/inforesources/county-ihss-offices',
    isFavorite: false,
    zipRegions: ['9'],
    tags: ['Financial Assistance', 'Direct Support']
  },

  // Local Resources
  {
    id: 'ca-local-1',
    title: 'Family Resource Centers (FRCs) - California',
    category: 'local',
    description: 'Parent-to-parent support and training for families with children with developmental delays or disabilities. Call 1-800-515-BABY.',
    link: 'https://www.dds.ca.gov/services/early-start',
    isFavorite: false,
    zipRegions: ['9'],
    tags: ['Disability Support', 'Education/Training']
  },
  {
    id: 'ca-local-2',
    title: 'Alzheimer\'s Los Angeles',
    category: 'local',
    description: 'Improves lives of families affected by Alzheimer\'s and Dementia through awareness, programs, and compassionate support.',
    link: 'https://www.alzheimersla.org',
    isFavorite: false,
    zipRegions: ['900', '901', '902', '903', '904', '905'],
    tags: ['Mental Health', 'Direct Support', 'Older Adults']
  },
  {
    id: 'ca-local-3',
    title: 'Masada Homes - Los Angeles County',
    category: 'local',
    description: 'Caregiver and case management services, therapeutic behavioral services, and mental health services for children aged 0-5.',
    link: 'https://www.masadahomes.org',
    isFavorite: false,
    zipRegions: ['900', '901', '902', '903', '904', '905'],
    tags: ['Mental Health', 'Direct Support', 'Children']
  },
  {
    id: 'ca-local-4',
    title: 'Meals on Wheels - California',
    category: 'local',
    description: 'Delivers nutritious meals to homebound seniors with wellness checks. Contact varies by location.',
    link: 'https://www.mealsonwheelsamerica.org',
    isFavorite: false,
    zipRegions: ['9'],
    tags: ['Direct Support', 'Older Adults']
  },
  {
    id: 'ca-local-5',
    title: 'Child Care Law Center',
    category: 'local',
    description: 'Legal advice for families facing child care discrimination due to disability. Call 415-394-7144.',
    link: 'https://www.childcarelaw.org',
    isFavorite: false,
    zipRegions: ['941'],
    tags: ['Legal Aid', 'Children']
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
                            {resource.tags && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {resource.tags.slice(0, 3).map((tag, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                                {resource.tags.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{resource.tags.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            )}
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
