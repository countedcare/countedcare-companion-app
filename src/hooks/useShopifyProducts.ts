
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchShopifyProducts, ShopifyProduct } from '@/lib/shopify';

export const useShopifyProducts = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showHsaOnly, setShowHsaOnly] = useState(false);

  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['shopify-products'],
    queryFn: () => fetchShopifyProducts(50),
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
