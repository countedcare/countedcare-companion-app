// src/hooks/usePlacesAutocomplete.ts
import { useCallback, useEffect, useRef, useState } from "react";
import useGoogleMapsAPI, {
  getGlobalAutocompleteService,
  getGlobalPlacesService,
} from "./useGoogleMapsAPI";

type Prediction = google.maps.places.AutocompletePrediction;

export type SelectedPlace = {
  placeId: string;
  description: string;
  formattedAddress: string;
  location: { lat: number; lng: number };
};

type Options = {
  debounceMs?: number;
  minLength?: number;
  componentRestrictions?: { country: string | string[] };
  types?: string[]; // e.g. ['geocode'] or ['geocode','establishment']
  fields?: (keyof google.maps.places.PlaceResult)[];
};

export default function usePlacesAutocomplete(opts: Options = {}) {
  const {
    debounceMs = 200,
    minLength = 2,
    componentRestrictions,
    types = ["geocode"],
    fields = ["formatted_address", "geometry", "name", "place_id"],
  } = opts;

  const { isConfigured, isLoading, error: mapsError } = useGoogleMapsAPI();
  const [input, setInput] = useState("");
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [highlight, setHighlight] = useState<number>(-1);

  // One session token per typing session; reset after a successful selection.
  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const ensureToken = () => {
    if (!sessionTokenRef.current) {
      sessionTokenRef.current = new google.maps.places.AutocompleteSessionToken();
      // eslint-disable-next-line no-console
      console.debug("[places] new AutocompleteSessionToken created");
    }
    return sessionTokenRef.current;
  };

  const queryPredictions = useCallback(
    (value: string) => {
      if (!isConfigured || !window.google?.maps?.places) {
        // eslint-disable-next-line no-console
        console.debug("[places] skip query: maps not ready");
        return;
      }
      const svc = getGlobalAutocompleteService();
      const token = ensureToken();

      const request: google.maps.places.AutocompletionRequest = {
        input: value,
        // Only include componentRestrictions if provided to avoid invalid shape
        ...(componentRestrictions ? { componentRestrictions } : {}),
        types,
        sessionToken: token,
      };

      // eslint-disable-next-line no-console
      console.debug("[places] getPlacePredictions request:", request);

      setLoading(true);
      setErr(null);

      try {
        svc.getPlacePredictions(request, (res, status) => {
          setLoading(false);
          // eslint-disable-next-line no-console
          console.debug("[places] status:", status, "results:", res);

          if (status === google.maps.places.PlacesServiceStatus.OK && res) {
            setPredictions(res);
          } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
            setPredictions([]);
          } else {
            const message = `Autocomplete error: ${status}`;
            setErr(message);
            setPredictions([]);
            // eslint-disable-next-line no-console
            console.warn("[places]", message, res);
          }
        });
      } catch (e) {
        setLoading(false);
        const message = e instanceof Error ? e.message : String(e);
        setErr(`Autocomplete exception: ${message}`);
        setPredictions([]);
        // eslint-disable-next-line no-console
        console.error("[places] exception during getPlacePredictions:", e);
      }
    },
    [isConfigured]
  );

  // Debounced input watcher
  useEffect(() => {
    if (!isConfigured) {
      // eslint-disable-next-line no-console
      console.debug("[places] effect: maps not configured yet");
      return;
    }
    const trimmed = input.trim();
    if (trimmed.length < minLength) {
      setPredictions([]);
      return;
    }

    const t = window.setTimeout(() => queryPredictions(trimmed), debounceMs);
    return () => window.clearTimeout(t);
  }, [input, isConfigured, minLength, debounceMs]);

  const selectPrediction = useCallback(
    (prediction: Prediction): Promise<SelectedPlace> => {
      if (!isConfigured || !window.google?.maps?.places) {
        return Promise.reject(new Error("Maps not ready"));
      }
      const places = getGlobalPlacesService();
      const token = ensureToken();

      // eslint-disable-next-line no-console
      console.debug("[places] getDetails for place_id:", prediction.place_id);

      return new Promise((resolve, reject) => {
        places.getDetails(
          { placeId: prediction.place_id!, fields: fields as string[], sessionToken: token },
          (place, status) => {
            // eslint-disable-next-line no-console
            console.debug("[places] getDetails status:", status, "place:", place);

            if (status !== google.maps.places.PlacesServiceStatus.OK || !place) {
              reject(new Error(`Place details error: ${status}`));
              return;
            }

            // Reset token for next session
            sessionTokenRef.current = null;

            const lat = place.geometry?.location?.lat();
            const lng = place.geometry?.location?.lng();
            const formattedAddress = place.formatted_address || prediction.description || "";
            if (lat == null || lng == null) {
              reject(new Error("Place has no geometry"));
              return;
            }

            const selected: SelectedPlace = {
              placeId: place.place_id!,
              description: prediction.description || place.name || "",
              formattedAddress,
              location: { lat, lng },
            };

            // Lock input to the chosen address and clear predictions
            setInput(formattedAddress);
            setPredictions([]);
            setHighlight(-1);

            resolve(selected);
          }
        );
      });
    },
    [isConfigured, fields]
  );

  return {
    isConfigured,
    isLoading: isLoading || loading,
    error: mapsError || err,
    input,
    predictions,
    highlightIndex: highlight,
    // actions
    setInput,
    setHighlight,
    selectPrediction,
  };
}
