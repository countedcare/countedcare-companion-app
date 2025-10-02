import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type State = {
  apiKey?: string;
  isConfigured: boolean;
  isLoading: boolean;
  error?: string | null;
};

declare global {
  interface Window {
    __mapsLoaderPromise?: Promise<void>;
  }
}

function loadScriptOnce(src: string) {
  if (!window.__mapsLoaderPromise) {
    window.__mapsLoaderPromise = new Promise<void>((resolve, reject) => {
      const el = document.createElement("script");
      el.src = src;
      el.async = true;
      el.onerror = () => reject(new Error("Failed to load Google Maps JS API script."));
      el.onload = () => resolve();
      document.head.appendChild(el);
    });
  }
  return window.__mapsLoaderPromise!;
}

export default function useGoogleMapsAPI(apiKeyOverride?: string): State {
  const [isConfigured, setConfigured] = useState(false);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string | undefined>(apiKeyOverride);

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      setLoading(true);
      setError(null);

      try {
        // 1. Fetch API key from Edge Function if not provided as override
        let key = apiKeyOverride;
        
        if (!key) {
          console.log("Fetching Google Maps API key from edge function...");
          const { data, error: fetchError } = await supabase.functions.invoke(
            'get-google-maps-browser-key'
          );

          if (fetchError) {
            throw new Error(`Failed to fetch API key: ${fetchError.message}`);
          }

          if (!data?.apiKey) {
            throw new Error("API key not returned from edge function");
          }

          key = data.apiKey;
          setApiKey(key);
          console.log("Successfully fetched Google Maps API key");
        }

        if (!key) {
          setError("Missing Google Maps API key.");
          setLoading(false);
          return;
        }

        // 2. Load Google Maps script with the fetched key
        const url = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
          key
        )}&libraries=places&v=weekly`;

        await loadScriptOnce(url);

        // 3. Verify Places library loaded successfully
        const ok = !!(window.google?.maps?.places);
        if (!ok) {
          const origin = window.location.origin;
          setError(
            `Google Maps Places library not available.
• Ensure "Maps JavaScript API" AND "Places API" are enabled.
• In Credentials → your key → Application restrictions: include referrer ${origin}/*
• If API restrictions are on, allow both "Maps JavaScript API" and "Places API".`
          );
          setConfigured(false);
        } else {
          setConfigured(true);
        }
      } catch (e: any) {
        const msg = String(e?.message || e);
        const help = msg.includes("RefererNotAllowed")
          ? `API key blocked for this domain. Add referrer ${window.location.origin}/* to your key restrictions.`
          : msg;
        if (!cancelled) setError(help);
        console.error("Error loading Google Maps:", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    boot();
    return () => {
      cancelled = true;
    };
  }, [apiKeyOverride]);

  return { apiKey, isConfigured, isLoading, error };
}

// Helper functions for components that need the services directly
export function areGoogleMapsServicesReady(): boolean {
  return !!(window.google?.maps?.places);
}

export function getGlobalAutocompleteService(): google.maps.places.AutocompleteService {
  if (!areGoogleMapsServicesReady()) throw new Error("Maps not ready");
  return new google.maps.places.AutocompleteService();
}

export function getGlobalPlacesService(): google.maps.places.PlacesService {
  if (!areGoogleMapsServicesReady()) throw new Error("Maps not ready");
  const dummy = document.createElement("div");
  return new google.maps.places.PlacesService(dummy);
}
