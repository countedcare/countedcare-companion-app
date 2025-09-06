
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Global state to ensure script loads only once across all components
let isScriptLoading = false;
let isScriptLoaded = false;
let loadingPromise: Promise<void> | null = null;
let currentApiKey: string | null = null;

// Global services instances
let globalAutocompleteService: google.maps.places.AutocompleteService | null = null;
let globalPlacesService: google.maps.places.PlacesService | null = null;
let hiddenServiceDiv: HTMLDivElement | null = null;

// Global function to check if Google Maps is ready
const isGoogleMapsReady = (): boolean => {
  return !!(window.google?.maps?.places);
};

// Global function to initialize services after Google Maps loads
const initializeGoogleMapsServices = (): void => {
  try {
    console.log('Initializing Google Maps services...');
    
    // Create hidden div for PlacesService if it doesn't exist
    if (!hiddenServiceDiv) {
      hiddenServiceDiv = document.createElement('div');
      hiddenServiceDiv.style.display = 'none';
      hiddenServiceDiv.setAttribute('id', 'google-maps-service-div');
      document.body.appendChild(hiddenServiceDiv);
      console.log('Created hidden div for PlacesService');
    }
    
    // Initialize AutocompleteService
    if (!globalAutocompleteService && window.google?.maps?.places?.AutocompleteService) {
      globalAutocompleteService = new google.maps.places.AutocompleteService();
      console.log('Initialized global AutocompleteService');
    }
    
    // Initialize PlacesService
    if (!globalPlacesService && window.google?.maps?.places?.PlacesService && hiddenServiceDiv) {
      globalPlacesService = new google.maps.places.PlacesService(hiddenServiceDiv);
      console.log('Initialized global PlacesService');
    }
    
    console.log('Google Maps services initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Google Maps services:', error);
  }
};

// Global function to get AutocompleteService instance
export const getGlobalAutocompleteService = (): google.maps.places.AutocompleteService | null => {
  return globalAutocompleteService;
};

// Global function to get PlacesService instance
export const getGlobalPlacesService = (): google.maps.places.PlacesService | null => {
  return globalPlacesService;
};

// Global function to check if services are ready
export const areGoogleMapsServicesReady = (): boolean => {
  return !!(globalAutocompleteService && globalPlacesService);
};

// Global function to load Google Maps script
const loadGoogleMapsScriptGlobally = async (apiKey: string): Promise<void> => {
  // If already loaded with the same key, return immediately
  if (isScriptLoaded && currentApiKey === apiKey && isGoogleMapsReady()) {
    console.log('Google Maps already loaded with same API key');
    return Promise.resolve();
  }

  // If currently loading with the same key, wait for existing promise
  if (isScriptLoading && currentApiKey === apiKey && loadingPromise) {
    console.log('Google Maps script already loading, waiting...');
    return loadingPromise;
  }

  // If loaded with different key or need fresh load, clean up first
  if (currentApiKey !== apiKey || !isGoogleMapsReady()) {
    console.log('Cleaning up existing Google Maps scripts for fresh load');
    
    // Reset global state
    isScriptLoading = false;
    isScriptLoaded = false;
    loadingPromise = null;
    
    // Remove existing scripts
    const existingScripts = document.querySelectorAll('script[src*="maps.googleapis.com"]');
    existingScripts.forEach(script => {
      const scriptElement = script as HTMLScriptElement;
      console.log('Removing existing Google Maps script:', scriptElement.src);
      script.remove();
    });
    
    // Clear global callback
    if ((window as any).initGoogleMapsAPI) {
      delete (window as any).initGoogleMapsAPI;
    }
    
    // Clear Google Maps from window if it exists
    if (window.google) {
      delete (window as any).google;
    }
  }

  // Start loading process
  isScriptLoading = true;
  currentApiKey = apiKey;

  loadingPromise = new Promise((resolve, reject) => {
    console.log('Starting to load Google Maps script with key:', apiKey ? 'present' : 'missing');

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMapsAPI&loading=async`;
    script.async = true;
    script.defer = true;
    script.setAttribute('data-google-maps-script', 'true');

    console.log('Loading Google Maps with URL:', script.src);

    // Set up global callback
    (window as any).initGoogleMapsAPI = () => {
      console.log('Google Maps API loaded successfully via callback');
      
      if (isGoogleMapsReady()) {
        // Initialize services immediately after script loads
        initializeGoogleMapsServices();
        isScriptLoaded = true;
        isScriptLoading = false;
        resolve();
      } else {
        console.error('Google Maps callback fired but places library not available');
        isScriptLoading = false;
        reject(new Error('Google Maps Places library not available after loading'));
      }
    };

    // Backup check in case callback doesn't fire
    script.onload = () => {
      console.log('Google Maps script onload event fired');
      
      // Give a moment for libraries to initialize
      setTimeout(() => {
        if (isGoogleMapsReady() && !isScriptLoaded) {
          console.log('Google Maps ready but callback missed, resolving manually');
          // Initialize services in backup path too
          initializeGoogleMapsServices();
          isScriptLoaded = true;
          isScriptLoading = false;
          resolve();
        }
      }, 100);
    };

    script.onerror = (error) => {
      console.error('Failed to load Google Maps script:', error);
      isScriptLoading = false;
      isScriptLoaded = false;
      currentApiKey = null;
      reject(new Error('Failed to load Google Maps script'));
    };

    document.head.appendChild(script);
    console.log('Google Maps script injected into DOM');
  });

  return loadingPromise;
};

const useGoogleMapsAPI = () => {
  const [apiKey, setApiKey] = useState<string>('');
  const [isConfigured, setIsConfigured] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchApiKey();
  }, []);

  const fetchApiKey = async () => {
    try {
      console.log('Fetching Google Maps API key from Supabase...');
      const { data, error } = await supabase.functions.invoke('get-google-maps-browser-key');
      
      if (error) {
        console.error('Error fetching Google Maps API key:', error);
        return;
      }

      console.log('Google Maps API key response:', data);
      
      if (data?.apiKey) {
        const key = data.apiKey;
        console.log('Setting API key:', key ? 'API key received' : 'No API key');
        setApiKey(key);
        loadGoogleMapsScript(key);
      } else {
        console.error('No API key received from Supabase function');
      }
    } catch (error) {
      console.error('Error fetching Google Maps API key:', error);
    }
  };

  const loadGoogleMapsScript = async (key: string) => {
    if (!key) return;

    setIsLoading(true);
    
    try {
      await loadGoogleMapsScriptGlobally(key);
      console.log('Google Maps script loaded successfully');
      setIsConfigured(true);
    } catch (error) {
      console.error('Failed to load Google Maps script:', error);
      setIsConfigured(false);
    } finally {
      setIsLoading(false);
    }
  };

  const saveApiKey = (key: string) => {
    localStorage.setItem('google-maps-api-key', key);
    setApiKey(key);
    loadGoogleMapsScript(key);
  };

  const clearApiKey = () => {
    localStorage.removeItem('google-maps-api-key');
    setApiKey('');
    setIsConfigured(false);
  };

  const refreshApiKey = () => {
    localStorage.removeItem('google-maps-api-key');
    fetchApiKey();
  };

  return {
    apiKey,
    isConfigured,
    isLoading,
    saveApiKey,
    clearApiKey,
    refreshApiKey
  };
};

export default useGoogleMapsAPI;
