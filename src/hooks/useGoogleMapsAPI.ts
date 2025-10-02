import { useEffect, useMemo, useState } from "react";

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

  const apiKey = useMemo(
    () => apiKeyOverride || import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    [apiKeyOverride]
  );

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      setLoading(true);
      setError(null);

      if (!apiKey) {
        setError("Missing Google Maps API key (VITE_GOOGLE_MAPS_API_KEY).");
        setLoading(false);
        return;
      }

      try {
        // Always request the Places library — required for Autocomplete
        const url = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
          apiKey
        )}&libraries=places&v=weekly`;

        await loadScriptOnce(url);

        // If the script returns 200 but the key is blocked/restricted,
        // Google logs an error in the console *and* the Places lib is missing.
        const ok = !!(window.google?.maps?.places);
        if (!ok) {
          // Common cases → give actionable help
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
        // When referrer is blocked, Google often throws in console:
        // "RefererNotAllowedMapError"
        const help = msg.includes("RefererNotAllowed")
          ? `API key blocked for this domain. Add referrer ${window.location.origin}/* to your key restrictions.`
          : msg;
        if (!cancelled) setError(help);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    boot();
    return () => {
      cancelled = true;
    };
  }, [apiKey]);

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
