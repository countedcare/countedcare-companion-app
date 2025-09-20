// src/hooks/useGoogleMapsAPI.ts
import { useEffect, useRef, useState } from "react";

/**
 * How this works:
 * - Tries to get a BROWSER key from VITE_GOOGLE_MAPS_API_KEY
 * - If not found, fetches from your Supabase Edge Function hosted at:
 *     https://<PROJECT_REF>.functions.supabase.co/get-google-maps-browser-key
 *   (or VITE_SUPABASE_FUNCTIONS_URL if provided)
 * - Loads Maps JS only once with libraries=places
 * - Exposes global singletons for AutocompleteService and PlacesService
 */

declare global {
  interface Window {
    __GMAPS_LOADED__?: boolean;
    __GMAPS_LOADING__?: boolean;
    __GMAPS_KEY__?: string;
    __AUTOCOMPLETE_SERVICE__?: google.maps.places.AutocompleteService;
    __PLACES_SERVICE__?: google.maps.places.PlacesService;
  }
}

const SCRIPT_ATTR = "data-google-maps-loader";

function loadScript(key: string): Promise<void> {
  if (window.google?.maps?.places) {
    window.__GMAPS_LOADED__ = true;
    return Promise.resolve();
  }
  if (window.__GMAPS_LOADING__) {
    // already loading: wait for it
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("Maps load timeout")), 20000);
      const poll = () => {
        if (window.google?.maps?.places) {
          clearTimeout(timer);
          resolve();
        } else {
          setTimeout(poll, 50);
        }
      };
      poll();
    });
  }

  const existing = document.querySelector<HTMLScriptElement>(`script[${SCRIPT_ATTR}="true"]`);
  if (existing) {
    // attach listeners
    return new Promise((resolve, reject) => {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Maps script error")));
    });
  }

  window.__GMAPS_LOADING__ = true;
  const s = document.createElement("script");
  s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
    key
  )}&libraries=places`;
  s.async = true;
  s.defer = true;
  s.setAttribute(SCRIPT_ATTR, "true");

  return new Promise((resolve, reject) => {
    s.onload = () => {
      window.__GMAPS_LOADING__ = false;
      if (window.google?.maps?.places) {
        window.__GMAPS_LOADED__ = true;
        resolve();
      } else {
        reject(new Error("Google Maps Places library did not initialize"));
      }
    };
    s.onerror = () => {
      window.__GMAPS_LOADING__ = false;
      reject(new Error("Failed to load Google Maps API"));
    };
    document.head.appendChild(s);
  });
}

export function areGoogleMapsServicesReady(): boolean {
  return !!(window.google?.maps?.places);
}

export function getGlobalAutocompleteService(): google.maps.places.AutocompleteService {
  if (!areGoogleMapsServicesReady()) throw new Error("Maps not ready");
  if (!window.__AUTOCOMPLETE_SERVICE__) {
    window.__AUTOCOMPLETE_SERVICE__ = new google.maps.places.AutocompleteService();
  }
  return window.__AUTOCOMPLETE_SERVICE__;
}

export function getGlobalPlacesService(): google.maps.places.PlacesService {
  if (!areGoogleMapsServicesReady()) throw new Error("Maps not ready");
  if (!window.__PLACES_SERVICE__) {
    const dummy = document.createElement("div");
    window.__PLACES_SERVICE__ = new google.maps.places.PlacesService(dummy);
  }
  return window.__PLACES_SERVICE__;
}

async function fetchKeyFromFunction(): Promise<string | null> {
  try {
    const base = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL || "/functions/v1";
    const res = await fetch(`${base}/get-google-maps-browser-key`, { method: "GET" });

    if (!res.ok) {
      console.error(
        "get-google-maps-browser-key failed:",
        res.status,
        await res.text().catch(() => "")
      );
      return null;
    }

    const json = await res.json().catch(() => ({}));
    return json?.apiKey || null;
  } catch (e) {
    console.error("fetchKeyFromFunction error:", e);
    return null;
  }
}

export default function useGoogleMapsAPI() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isConfigured, setIsConfigured] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    (async () => {
      try {
        // Check if Google Maps is already loaded
        if (areGoogleMapsServicesReady()) {
          console.log("Google Maps already loaded, configuring...");
          // Warm up singletons
          getGlobalAutocompleteService();
          getGlobalPlacesService();
          setIsConfigured(true);
          setIsLoading(false);
          return;
        }

        // 1) try env
        let key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

        // 2) otherwise try edge function
        if (!key) {
          key = (await fetchKeyFromFunction()) || undefined;
        }

        if (!key) {
          setError("Missing Google Maps browser API key");
          setIsConfigured(false);
          setIsLoading(false);
          return;
        }
        window.__GMAPS_KEY__ = key;

        // 3) load script once
        await loadScript(key);

        // 4) verify places present
        if (!areGoogleMapsServicesReady()) {
          setError("Google Maps Places library did not initialize");
          setIsConfigured(false);
          setIsLoading(false);
          return;
        }

        // 5) warm up singletons
        getGlobalAutocompleteService();
        getGlobalPlacesService();

        setIsConfigured(true);
        setIsLoading(false);
      } catch (e: any) {
        setError(e?.message || "Failed to load Google Maps API");
        setIsConfigured(false);
        setIsLoading(false);
      }
    })();
  }, []);

  return { isConfigured, isLoading, error, apiKey: window.__GMAPS_KEY__ || "" };
}

