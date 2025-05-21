
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Search, ShoppingBag, Star, Filter, Check, X } from 'lucide-react';
import Layout from '@/components/Layout';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  hsaEligible: boolean;
  fsaEligible: boolean;
  rating: number;
  image: string;
}

const products: Product[] = [
  {
    id: 'prod-1',
    name: 'Digital Blood Pressure Monitor',
    category: 'Medical Devices',
    price: 49.99,
    hsaEligible: true,
    fsaEligible: true,
    rating: 4.5,
    image: '/placeholder.svg'
  },
  {
    id: 'prod-2',
    name: 'Pulse Oximeter',
    category: 'Medical Devices',
    price: 29.99,
    hsaEligible: true,
    fsaEligible: true,
    rating: 4.3,
    image: '/placeholder.svg'
  },
  {
    id: 'prod-3',
    name: 'Heating Pad',
    category: 'Pain Management',
    price: 24.99,
    hsaEligible: true,
    fsaEligible: true,
    rating: 4.1,
    image: '/placeholder.svg'
  },
  {
    id: 'prod-4',
    name: 'Bathroom Safety Rail',
    category: 'Mobility',
    price: 39.99,
    hsaEligible: false,
    fsaEligible: false,
    rating: 4.7,
    image: '/placeholder.svg'
  },
  {
    id: 'prod-5',
    name: 'Pill Organizer with Alarm',
    category: 'Medication Management',
    price: 18.99,
    hsaEligible: false,
    fsaEligible: false,
    rating: 4.0,
    image: '/placeholder.svg'
  }
];

const Shop = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [showHsaOnly, setShowHsaOnly] = useState(false);
  
  const categories = Array.from(new Set(products.map(product => product.category)));
  
  // Filter products based on search, tab, and HSA filter
  const filteredProducts = products.filter(product => {
    const matchesSearch = !searchTerm || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = activeTab === 'all' || product.category === activeTab;
    
    const matchesHsa = !showHsaOnly || product.hsaEligible;
    
    return matchesSearch && matchesTab && matchesHsa;
  });
  
  // Stars for ratings display
  const renderRatingStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    
    return (
      <div className="flex items-center">
        {Array(fullStars).fill(0).map((_, i) => (
          <Star key={`full-${i}`} className="h-4 w-4 fill-primary text-primary" />
        ))}
        {halfStar && (
          <Star className="h-4 w-4 fill-primary text-primary" />
        )}
        {Array(5 - fullStars - (halfStar ? 1 : 0)).fill(0).map((_, i) => (
          <Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />
        ))}
        <span className="ml-1 text-sm text-gray-600">{rating}</span>
      </div>
    );
  };
  
  return (
    <Layout>
      <div className="container-padding py-6">
        <h1 className="text-2xl font-heading mb-6">
          Tax-Deductible Products
        </h1>
        
        <div className="text-sm text-gray-500 mb-6">
          Shop for HSA/FSA eligible medical products that may qualify for tax deductions.
        </div>
        
        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input 
            placeholder="Search products..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* Filters */}
        <div className="mb-6 flex items-center justify-between">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowHsaOnly(!showHsaOnly)}
            className={`flex items-center ${showHsaOnly ? 'bg-primary/10 text-primary border-primary' : ''}`}
          >
            {showHsaOnly ? <Check className="h-4 w-4 mr-1" /> : <Filter className="h-4 w-4 mr-1" />}
            HSA/FSA Eligible Only
          </Button>
        </div>
        
        {/* Category Tabs */}
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 overflow-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            {categories.map(category => (
              <TabsTrigger key={category} value={category}>{category}</TabsTrigger>
            ))}
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-0">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredProducts.map((product) => (
                  <Card key={product.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{product.name}</CardTitle>
                          <CardDescription>{product.category}</CardDescription>
                        </div>
                        <Badge variant={product.hsaEligible ? 'default' : 'outline'} className={product.hsaEligible ? 'bg-green-600' : ''}>
                          {product.hsaEligible ? 'HSA/FSA Eligible' : 'Not Eligible'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-32 mb-4 flex items-center justify-center bg-gray-100 rounded-md">
                        <ShoppingBag className="h-12 w-12 text-gray-300" />
                      </div>
                      <div className="flex justify-between items-center">
                        <div>{renderRatingStars(product.rating)}</div>
                        <div className="text-lg font-medium">${product.price.toFixed(2)}</div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full">View Details</Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                No products match your search criteria
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <div className="mt-8 p-4 bg-primary/10 rounded-md">
          <h3 className="font-medium mb-2">About HSA/FSA Eligible Products</h3>
          <p className="text-sm text-gray-600">
            Products marked as HSA/FSA eligible may qualify for payment using Health Savings Account 
            or Flexible Spending Account funds. These expenses may also qualify for medical expense 
            tax deductions under IRS Publication 502.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Shop;
