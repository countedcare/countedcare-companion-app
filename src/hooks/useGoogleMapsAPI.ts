
import { useState, useEffect } from 'react';

// Global state to ensure script loads only once
let isScriptLoading = false;
let isScriptLoaded = false;
let loadingPromise: Promise<void> | null = null;

const useGoogleMapsAPI = () => {
  const [apiKey, setApiKey] = useState<string>('');
  const [isConfigured, setIsConfigured] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if API key is stored in localStorage
    const storedApiKey = localStorage.getItem('google-maps-api-key');
    if (storedApiKey) {
      setApiKey(storedApiKey);
      loadGoogleMapsScript(storedApiKey);
    }
  }, []);

  const loadGoogleMapsScript = async (key: string) => {
    if (!key) return;

    // If script is already loaded, mark as configured
    if (isScriptLoaded && window.google?.maps?.places) {
      setIsConfigured(true);
      return;
    }

    // If script is currently loading, wait for it
    if (isScriptLoading && loadingPromise) {
      setIsLoading(true);
      try {
        await loadingPromise;
        setIsConfigured(true);
      } catch (error) {
        console.error('Google Maps script loading failed:', error);
        setIsConfigured(false);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Start loading the script
    if (!isScriptLoading) {
      isScriptLoading = true;
      setIsLoading(true);

      loadingPromise = new Promise((resolve, reject) => {
        // Remove existing scripts to avoid conflicts
        const existingScripts = document.querySelectorAll('script[src*="maps.googleapis.com"]');
        existingScripts.forEach(script => script.remove());

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places&callback=initGoogleMapsAPI&loading=async`;
        script.async = true;
        script.defer = true;

        // Add global callback
        (window as any).initGoogleMapsAPI = () => {
          console.log('Google Maps API loaded successfully');
          isScriptLoaded = true;
          isScriptLoading = false;
          resolve();
        };

        script.onerror = (error) => {
          console.error('Failed to load Google Maps API:', error);
          isScriptLoading = false;
          reject(error);
        };

        document.head.appendChild(script);
      });

      try {
        await loadingPromise;
        setIsConfigured(true);
      } catch (error) {
        console.error('Google Maps script loading failed:', error);
        setIsConfigured(false);
      } finally {
        setIsLoading(false);
      }
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

  return {
    apiKey,
    isConfigured,
    isLoading,
    saveApiKey,
    clearApiKey
  };
};

export default useGoogleMapsAPI;
