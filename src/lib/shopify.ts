
import Client from 'shopify-buy';

// Initialize the Shopify client
export const shopifyClient = Client.buildClient({
  domain: 'your-shop-name.myshopify.com', // Replace with your actual Shopify domain
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
  try {
    const products = await shopifyClient.product.fetchAll(first);
    return products as ShopifyProduct[];
  } catch (error) {
    console.error('Error fetching Shopify products:', error);
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
