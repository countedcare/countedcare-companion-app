
import Client from 'shopify-buy';

// Initialize the Shopify client
export const shopifyClient = Client.buildClient({
  domain: 'apex-quality-resources.myshopify.com',
  storefrontAccessToken: '4331aad078787f581d09a23b56f7acae',
});

export interface ShopifyProduct {
  id: string;
  title: string;
  handle: string;
  description: string;
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  images: {
    edges: Array<{
      node: {
        url: string;
        altText?: string;
      };
    }>;
  };
  variants: {
    edges: Array<{
      node: {
        id: string;
        title: string;
        price: {
          amount: string;
          currencyCode: string;
        };
        available: boolean;
      };
    }>;
  };
  tags: string[];
}

export interface CartItem {
  variantId: string;
  quantity: number;
}

// Fetch products from Shopify
export const fetchShopifyProducts = async (first: number = 20): Promise<ShopifyProduct[]> => {
  console.log('Attempting to fetch products from:', 'your-shop-name.myshopify.com');
  console.log('Using token:', '4331aad078787f581d09a23b56f7acae');
  
  try {
    const products = await shopifyClient.product.fetchAll(first);
    console.log('Successfully fetched products:', products);
    return products as ShopifyProduct[];
  } catch (error) {
    console.error('Error fetching Shopify products:', error);
    console.error('This is likely due to:');
    console.error('1. Incorrect shop domain (currently: your-shop-name.myshopify.com)');
    console.error('2. Invalid or expired Storefront Access Token');
    console.error('3. Storefront API not enabled for this token');
    return [];
  }
};

// Create checkout
export const createCheckout = async (lineItems: CartItem[]) => {
  try {
    const checkout = await shopifyClient.checkout.create();
    if (lineItems.length > 0) {
      await shopifyClient.checkout.addLineItems(checkout.id, lineItems);
    }
    return checkout;
  } catch (error) {
    console.error('Error creating checkout:', error);
    return null;
  }
};
