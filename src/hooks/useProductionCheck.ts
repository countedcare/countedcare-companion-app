import { useEffect, useState } from 'react';

interface ProductionReadinessCheck {
  isReady: boolean;
  warnings: string[];
  errors: string[];
}

export const useProductionCheck = (): ProductionReadinessCheck => {
  const [check, setCheck] = useState<ProductionReadinessCheck>({
    isReady: false,
    warnings: [],
    errors: []
  });

  useEffect(() => {
    const warnings: string[] = [];
    const errors: string[] = [];

    // Check for development mode
    if (import.meta.env.DEV) {
      warnings.push('Application is running in development mode');
    }

    // Check for Google Analytics configuration
    if (!import.meta.env.VITE_GA_MEASUREMENT_ID) {
      warnings.push('Google Analytics measurement ID not configured');
    }

    // Check for service worker support
    if (!('serviceWorker' in navigator)) {
      warnings.push('Service Worker not supported in this browser');
    }

    // Check for required environment variables
    const requiredEnvVars = [
      // Add any required env vars here
    ];

    requiredEnvVars.forEach(envVar => {
      if (!import.meta.env[envVar]) {
        errors.push(`Missing required environment variable: ${envVar}`);
      }
    });

    // Check for console.log statements in production
    if (import.meta.env.PROD) {
      // This would need to be checked at build time
      // For now, just a reminder
      warnings.push('Ensure all console.log statements have been removed');
    }

    const isReady = errors.length === 0;

    setCheck({ isReady, warnings, errors });
  }, []);

  return check;
};