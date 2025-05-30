
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Search, ShoppingBag, Star, Filter, Check, Loader2 } from 'lucide-react';
import Layout from '@/components/Layout';
import { useShopifyProducts } from '@/hooks/useShopifyProducts';

const Shop = () => {
  const {
    products,
    categories,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    showHsaOnly,
    setShowHsaOnly,
  } = useShopifyProducts();

  const handleProductClick = (product: any) => {
    // Open product in new tab for now - you can customize this later
    window.open(`https://your-shop-name.myshopify.com/products/${product.handle}`, '_blank');
  };

  const isHsaEligible = (product: any) => {
    return product.tags.some((tag: string) => 
      tag.toLowerCase().includes('hsa') || tag.toLowerCase().includes('fsa')
    );
  };

  const getProductPrice = (product: any) => {
    return parseFloat(product.priceRange.minVariantPrice.amount);
  };

  const getProductImage = (product: any) => {
    return product.images.edges[0]?.node.url || '/placeholder.svg';
  };

  if (error) {
    return (
      <Layout>
        <div className="container-padding py-6">
          <div className="text-center py-12">
            <p className="text-red-600">Error loading products. Please check your Shopify configuration.</p>
          </div>
        </div>
      </Layout>
    );
  }

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
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="mb-6 overflow-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            {categories.map(category => (
              <TabsTrigger key={category} value={category}>{category}</TabsTrigger>
            ))}
          </TabsList>
          
          <TabsContent value={selectedCategory} className="mt-0">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {products.map((product) => (
                  <Card key={product.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{product.title}</CardTitle>
                          <CardDescription className="line-clamp-2">
                            {product.description.substring(0, 100)}...
                          </CardDescription>
                        </div>
                        <Badge variant={isHsaEligible(product) ? 'default' : 'outline'} className={isHsaEligible(product) ? 'bg-green-600' : ''}>
                          {isHsaEligible(product) ? 'HSA/FSA Eligible' : 'Not Eligible'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-32 mb-4 flex items-center justify-center bg-gray-100 rounded-md overflow-hidden">
                        <img 
                          src={getProductImage(product)} 
                          alt={product.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.parentElement!.innerHTML = '<div class="flex items-center justify-center h-full"><svg class="h-12 w-12 text-gray-300" fill="currentColor" viewBox="0 0 24 24"><path d="M19 7h-3V6a4 4 0 0 0-8 0v1H5a1 1 0 0 0-1 1v11a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8a1 1 0 0 0-1-1zM10 6a2 2 0 0 1 4 0v1h-4V6zm8 13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V9h2v1a1 1 0 0 0 2 0V9h4v1a1 1 0 0 0 2 0V9h2v10z"/></svg></div>';
                          }}
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 fill-primary text-primary" />
                          <Star className="h-4 w-4 fill-primary text-primary" />
                          <Star className="h-4 w-4 fill-primary text-primary" />
                          <Star className="h-4 w-4 fill-primary text-primary" />
                          <Star className="h-4 w-4 text-gray-300" />
                          <span className="ml-1 text-sm text-gray-600">4.0</span>
                        </div>
                        <div className="text-lg font-medium">${getProductPrice(product).toFixed(2)}</div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full" 
                        onClick={() => handleProductClick(product)}
                      >
                        View Details
                      </Button>
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
