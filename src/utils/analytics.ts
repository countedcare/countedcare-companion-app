// Google Analytics utility functions
declare global {
  interface Window {
    gtag?: (command: string, targetId: string, config?: any) => void;
    dataLayer?: any[];
  }
}

export const initializeAnalytics = (measurementId?: string) => {
  if (!measurementId || typeof window === 'undefined') return;

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  
  // Define gtag function
  window.gtag = function() {
    window.dataLayer?.push(arguments);
  };

  // Configure Google Analytics
  window.gtag('js', new Date().toString());
  window.gtag('config', measurementId, {
    page_title: document.title,
    page_location: window.location.href
  });

  // Load Google Analytics script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  console.log('Google Analytics initialized with ID:', measurementId);
};

// Track page views
export const trackPageView = (path: string, title?: string) => {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('config', 'GA_MEASUREMENT_ID', {
    page_path: path,
    page_title: title || document.title
  });
};

// Track events
export const trackEvent = (action: string, parameters?: Record<string, any>) => {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('event', action, parameters);
};

// Track user properties
export const setUserProperties = (properties: Record<string, any>) => {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('config', 'GA_MEASUREMENT_ID', {
    user_properties: properties
  });
};

// Predefined event tracking functions for common actions
export const analytics = {
  // Authentication events
  signUp: (method: string = 'email') => {
    trackEvent('sign_up', { method });
  },
  
  signIn: (method: string = 'email') => {
    trackEvent('login', { method });
  },

  signOut: () => {
    trackEvent('logout');
  },

  // Expense tracking events
  expenseCreated: (category: string, amount: number) => {
    trackEvent('expense_created', { 
      category, 
      value: amount,
      currency: 'USD' 
    });
  },

  expenseUpdated: (category: string) => {
    trackEvent('expense_updated', { category });
  },

  receiptUploaded: () => {
    trackEvent('receipt_uploaded');
  },

  // Resource events
  resourceViewed: (resourceId: string, category?: string) => {
    trackEvent('resource_view', { 
      resource_id: resourceId,
      category 
    });
  },

  resourceSaved: (resourceId: string) => {
    trackEvent('resource_saved', { resource_id: resourceId });
  },

  resourceApplyClicked: (resourceId: string) => {
    trackEvent('resource_click_apply', { resource_id: resourceId });
  },

  // Feature usage
  featureUsed: (feature: string, details?: Record<string, any>) => {
    trackEvent('feature_used', { feature, ...details });
  },

  // Error tracking
  error: (description: string, fatal: boolean = false) => {
    trackEvent('exception', { description, fatal });
  },

  // Performance tracking
  timing: (name: string, value: number) => {
    trackEvent('timing_complete', { 
      name, 
      value: Math.round(value) 
    });
  }
};