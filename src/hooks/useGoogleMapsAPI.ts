
import { useState, useEffect } from 'react';

const useGoogleMapsAPI = () => {
  const [apiKey, setApiKey] = useState<string>('');
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    // Check if API key is stored in localStorage
    const storedApiKey = localStorage.getItem('google-maps-api-key');
    if (storedApiKey) {
      setApiKey(storedApiKey);
      setIsConfigured(true);
    }
  }, []);

  const saveApiKey = (key: string) => {
    localStorage.setItem('google-maps-api-key', key);
    setApiKey(key);
    setIsConfigured(true);
  };

  const clearApiKey = () => {
    localStorage.removeItem('google-maps-api-key');
    setApiKey('');
    setIsConfigured(false);
  };

  return {
    apiKey,
    isConfigured,
    saveApiKey,
    clearApiKey
  };
};

export default useGoogleMapsAPI;
