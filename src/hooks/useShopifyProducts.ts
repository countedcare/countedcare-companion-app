
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchShopifyProducts, ShopifyProduct } from '@/lib/shopify';

// Mock products for demo purposes
const mockProducts: ShopifyProduct[] = [
  {
    id: '1',
    title: 'Blood Pressure Monitor',
    handle: 'blood-pressure-monitor',
    description: 'Digital blood pressure monitor with large display and memory storage. HSA/FSA eligible medical device for home health monitoring.',
    priceRange: {
      minVariantPrice: {
        amount: '89.99',
        currencyCode: 'USD'
      }
    },
    images: {
      edges: [{
        node: {
          url: '/placeholder.svg',
          altText: 'Blood Pressure Monitor'
        }
      }]
    },
    variants: {
      edges: [{
        node: {
          id: 'variant-1',
          title: 'Default',
          price: {
            amount: '89.99',
            currencyCode: 'USD'
          },
          available: true
        }
      }]
    },
    tags: ['category:Medical Devices', 'HSA', 'FSA', 'health-monitoring']
  },
  {
    id: '2',
    title: 'First Aid Kit',
    handle: 'first-aid-kit',
    description: 'Complete first aid kit with bandages, antiseptics, and emergency supplies. Perfect for home and travel use.',
    priceRange: {
      minVariantPrice: {
        amount: '24.99',
        currencyCode: 'USD'
      }
    },
    images: {
      edges: [{
        node: {
          url: '/placeholder.svg',
          altText: 'First Aid Kit'
        }
      }]
    },
    variants: {
      edges: [{
        node: {
          id: 'variant-2',
          title: 'Standard',
          price: {
            amount: '24.99',
            currencyCode: 'USD'
          },
          available: true
        }
      }]
    },
    tags: ['category:First Aid', 'HSA', 'emergency-care']
  },
  {
    id: '3',
    title: 'Digital Thermometer',
    handle: 'digital-thermometer',
    description: 'Fast and accurate digital thermometer with fever indicator. Essential medical device for health monitoring.',
    priceRange: {
      minVariantPrice: {
        amount: '12.99',
        currencyCode: 'USD'
      }
    },
    images: {
      edges: [{
        node: {
          url: '/placeholder.svg',
          altText: 'Digital Thermometer'
        }
      }]
    },
    variants: {
      edges: [{
        node: {
          id: 'variant-3',
          title: 'Digital',
          price: {
            amount: '12.99',
            currencyCode: 'USD'
          },
          available: true
        }
      }]
    },
    tags: ['category:Medical Devices', 'HSA', 'FSA', 'temperature']
  },
  {
    id: '4',
    title: 'Reading Glasses',
    handle: 'reading-glasses',
    description: 'Prescription reading glasses for vision correction. Available in multiple strengths and styles.',
    priceRange: {
      minVariantPrice: {
        amount: '45.00',
        currencyCode: 'USD'
      }
    },
    images: {
      edges: [{
        node: {
          url: '/placeholder.svg',
          altText: 'Reading Glasses'
        }
      }]
    },
    variants: {
      edges: [{
        node: {
          id: 'variant-4',
          title: '+2.0',
          price: {
            amount: '45.00',
            currencyCode: 'USD'
          },
          available: true
        }
      }]
    },
    tags: ['category:Vision Care', 'vision', 'glasses']
  },
  {
    id: '5',
    title: 'Compression Socks',
    handle: 'compression-socks',
    description: 'Medical grade compression socks for improved circulation and leg support. Ideal for travel and daily wear.',
    priceRange: {
      minVariantPrice: {
        amount: '19.99',
        currencyCode: 'USD'
      }
    },
    images: {
      edges: [{
        node: {
          url: '/placeholder.svg',
          altText: 'Compression Socks'
        }
      }]
    },
    variants: {
      edges: [{
        node: {
          id: 'variant-5',
          title: 'Medium',
          price: {
            amount: '19.99',
            currencyCode: 'USD'
          },
          available: true
        }
      }]
    },
    tags: ['category:Medical Devices', 'HSA', 'FSA', 'circulation']
  },
  {
    id: '6',
    title: 'Heating Pad',
    handle: 'heating-pad',
    description: 'Electric heating pad for pain relief and muscle relaxation. Multiple heat settings with auto shut-off.',
    priceRange: {
      minVariantPrice: {
        amount: '34.99',
        currencyCode: 'USD'
      }
    },
    images: {
      edges: [{
        node: {
          url: '/placeholder.svg',
          altText: 'Heating Pad'
        }
      }]
    },
    variants: {
      edges: [{
        node: {
          id: 'variant-6',
          title: 'Standard',
          price: {
            amount: '34.99',
            currencyCode: 'USD'
          },
          available: true
        }
      }]
    },
    tags: ['category:Pain Relief', 'HSA', 'FSA', 'therapy']
  }
];

export const useShopifyProducts = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showHsaOnly, setShowHsaOnly] = useState(false);

  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['shopify-products'],
    queryFn: async () => {
      console.log('Attempting to fetch Shopify products...');
      const shopifyProducts = await fetchShopifyProducts(50);
      
      // If no products from Shopify (likely due to configuration), return mock data
      if (shopifyProducts.length === 0) {
        console.log('No Shopify products found, using mock data for demo');
        return mockProducts;
      }
      
      return shopifyProducts;
    },
  });

  // Extract categories from product tags
  const categories = Array.from(
    new Set(
      products.flatMap(product => 
        product.tags.filter(tag => 
          tag.toLowerCase().includes('category:')
        ).map(tag => tag.replace('category:', '').trim())
      )
    )
  );

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = !searchTerm || 
      product.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || 
      product.tags.some(tag => 
        tag.toLowerCase().includes(`category:${selectedCategory.toLowerCase()}`)
      );
    
    const matchesHsa = !showHsaOnly || 
      product.tags.some(tag => 
        tag.toLowerCase().includes('hsa') || tag.toLowerCase().includes('fsa')
      );
    
    return matchesSearch && matchesCategory && matchesHsa;
  });

  return {
    products: filteredProducts,
    allProducts: products,
    categories,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    showHsaOnly,
    setShowHsaOnly,
  };
};
