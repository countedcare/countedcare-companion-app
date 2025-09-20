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

  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const ensureToken = () => {
    if (!sessionTokenRef.current) {
      sessionTokenRef.current = new google.maps.places.AutocompleteSessionToken();
    }
    return sessionTokenRef.current;
  };

  const queryPredictions = useCallback(
    (value: string) => {
      if (!isConfigured) return;
      const svc = getGlobalAutocompleteService();
      setLoading(true);
      setErr(null);

      const token = ensureToken();
      const request: google.maps.places.AutocompletionRequest = {
        input: value,
        componentRestrictions,
        types,
        sessionToken: token,
      };

      svc.getPlacePredictions(request, (res, status) => {
        setLoading(false);
        if (status === google.maps.places.PlacesServiceStatus.OK && res) {
          setPredictions(res);
        } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
          setPredictions([]);
        } else {
          setErr(`Autocomplete error: ${status}`);
          setPredictions([]);
        }
      });
    },
    [isConfigured, componentRestrictions, types]
  );

  // Debounce input
  useEffect(() => {
    if (!isConfigured) return;
    if (input.trim().length < minLength) {
      setPredictions([]);
      return;
    }
    const t = window.setTimeout(() => queryPredictions(input.trim()), debounceMs);
    return () => window.clearTimeout(t);
  }, [input, isConfigured, minLength, debounceMs, queryPredictions]);

  const selectPrediction = useCallback(
    (prediction: Prediction): Promise<SelectedPlace> => {
      if (!isConfigured) return Promise.reject(new Error("Maps not ready"));
      const places = getGlobalPlacesService();
      const token = ensureToken();

      return new Promise((resolve, reject) => {
        places.getDetails(
          { placeId: prediction.place_id!, fields: fields as string[], sessionToken: token },
          (place, status) => {
            if (status !== google.maps.places.PlacesServiceStatus.OK || !place) {
              reject(new Error(`Place details error: ${status}`));
              return;
            }
            // reset token after successful selection
            sessionTokenRef.current = null;

            const lat = place.geometry?.location?.lat();
            const lng = place.geometry?.location?.lng();
            const formattedAddress = place.formatted_address || prediction.description || "";
            if (lat == null || lng == null) {
              reject(new Error("Place has no geometry"));
              return;
            }
            resolve({
              placeId: place.place_id!,
              description: prediction.description || place.name || "",
              formattedAddress,
              location: { lat, lng },
            });
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