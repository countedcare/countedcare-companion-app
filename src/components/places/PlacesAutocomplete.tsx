import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import './places.css';

interface PlacePrediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text?: string;
  };
}

interface PlacesAutocompleteProps {
  onPlaceSelect: (place: { formatted_address: string; place_id: string }) => void;
  placeholder?: string;
  label?: string;
  value?: string;
  apiKey: string;
  /** Use ['address'] for addresses (recommended). */
  types?: string[];
  className?: string;
  /** Optional country restriction, e.g. 'us' */
  country?: string | string[];
}

const LOAD_ATTR = 'data-google-maps-loader';

const PlacesAutocomplete: React.FC<PlacesAutocompleteProps> = ({
  onPlaceSelect,
  placeholder = 'Search for an address…',
  label,
  value = '',
  apiKey,
  types = ['address'],
  className = '',
  country,
}) => {
  const { toast } = useToast();

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null);

  const [inputValue, setInputValue] = useState(value);
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  const [isSearching, setIsSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  // keep internal input in sync with prop
  useEffect(() => setInputValue(value || ''), [value]);

  // --- Load Google Maps JS (Places) once, robustly
  useEffect(() => {
    if (!apiKey) {
      setLoadingError('API key is required');
      return;
    }

    // already loaded?
    if (window.google?.maps?.places) {
      setIsLoaded(true);
      return;
    }

    // existing loader?
    const existing = document.querySelector<HTMLScriptElement>(`script[${LOAD_ATTR}="true"]`);
    if (existing) {
      existing.addEventListener('load', () => setIsLoaded(true));
      existing.addEventListener('error', () => setLoadingError('Failed to load Google Maps API'));
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.setAttribute(LOAD_ATTR, 'true');

    script.onload = () => {
      if (window.google?.maps?.places) {
        setIsLoaded(true);
      } else {
        setLoadingError('Google Maps Places library did not initialize');
      }
    };
    script.onerror = () => {
      setLoadingError('Failed to load Google Maps API');
    };

    document.head.appendChild(script);
  }, [apiKey]);

  // --- Init services when library is ready
  useEffect(() => {
    if (!isLoaded || !window.google?.maps?.places) return;

    if (!autocompleteServiceRef.current) {
      autocompleteServiceRef.current = new google.maps.places.AutocompleteService();
    }
    if (!placesServiceRef.current) {
      const dummy = document.createElement('div');
      placesServiceRef.current = new google.maps.places.PlacesService(dummy);
    }
  }, [isLoaded]);

  // --- Click outside to close
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!dropdownRef.current || !inputRef.current) return;
      const t = e.target as Node;
      if (dropdownRef.current.contains(t) || inputRef.current.contains(t)) return;
      setOpen(false);
      setFocusedIndex(-1);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  // --- Debounced search when inputValue changes
  useEffect(() => {
    if (!isLoaded || !autocompleteServiceRef.current) return;

    const q = inputValue.trim();
    if (!q) {
      setPredictions([]);
      setOpen(false);
      return;
    }

    setIsSearching(true);
    const t = setTimeout(() => {
      const req: google.maps.places.AutocompletionRequest = {
        input: q,
        types: types as any,
      };
      if (country) {
        req.componentRestrictions = {
          country: Array.isArray(country) ? country : [country],
        } as any;
      }

      autocompleteServiceRef.current!.getPlacePredictions(req, (preds, status) => {
        setIsSearching(false);
        if (status === google.maps.places.PlacesServiceStatus.OK && preds && preds.length) {
          setPredictions(
            preds.map((p) => ({
              place_id: p.place_id!,
              description: p.description!,
              structured_formatting: {
                main_text: p.structured_formatting?.main_text || p.description!,
                secondary_text: p.structured_formatting?.secondary_text,
              },
            }))
          );
          setOpen(true);
          setFocusedIndex(-1);
        } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS || !preds?.length) {
          // Do NOT force fallback on zero results — just close the menu quietly.
          setPredictions([]);
          setOpen(false);
        } else {
          console.warn('Places prediction failed:', status);
          // transient errors shouldn't flip to fallback mode
          setPredictions([]);
          setOpen(false);
        }
      });
    }, 250);

    return () => clearTimeout(t);
  }, [inputValue, isLoaded, types, country]);

  const fetchDetails = useCallback(
    (placeId: string, description: string) => {
      if (!placesServiceRef.current) {
        // no details — fall back to prediction description
        onPlaceSelect({ formatted_address: description, place_id: placeId });
        setInputValue(description);
        setOpen(false);
        return;
      }

      placesServiceRef.current.getDetails(
        {
          placeId,
          fields: ['formatted_address', 'place_id', 'name'],
        },
        (place, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && place) {
            const formatted = place.formatted_address || place.name || description;
            onPlaceSelect({ formatted_address: formatted, place_id: place.place_id || placeId });
            setInputValue(formatted);
          } else {
            console.warn('getDetails failed:', status);
            onPlaceSelect({ formatted_address: description, place_id: placeId });
            setInputValue(description);
          }
          setOpen(false);
          setFocusedIndex(-1);
        }
      );
    },
    [onPlaceSelect]
  );

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (!open || predictions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex((i) => Math.min(i + 1, predictions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (focusedIndex >= 0) {
        const p = predictions[focusedIndex];
        fetchDetails(p.place_id, p.description);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
      setFocusedIndex(-1);
    }
  };

  const shouldShowFallback = !!loadingError;

  return (
    <div className={`space-y-2 relative ${className}`}>
      {label && <Label htmlFor="places-input">{label}</Label>}

      {shouldShowFallback ? (
        <div className="relative">
          <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <AlertCircle className="absolute right-3 top-3 h-4 w-4 text-orange-500" />
          <Input
            ref={inputRef}
            id="places-input"
            type="text"
            autoComplete="off"
            placeholder={placeholder}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="pl-10 pr-10"
          />
          <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Google Maps unavailable — manual input mode.
          </p>
        </div>
      ) : (
        <div className="relative">
          <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          {isSearching && (
            <Loader2 className="absolute right-3 top-3 h-4 w-4 text-muted-foreground animate-spin" />
          )}
          <Input
            ref={inputRef}
            id="places-input"
            type="text"
            autoComplete="off"
            placeholder={placeholder}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={() => {
              if (inputValue.trim() && predictions.length > 0) setOpen(true);
            }}
            onKeyDown={onKeyDown}
            className="pl-10 pr-10"
            disabled={!isLoaded}
          />

          {/* Dropdown */}
          {open && predictions.length > 0 && (
            <div
              ref={dropdownRef}
              className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto"
            >
              {predictions.map((p, idx) => {
                const active = idx === focusedIndex;
                return (
                  <button
                    type="button"
                    key={p.place_id}
                    className={`w-full text-left p-3 border-b last:border-b-0 hover:bg-gray-50 ${
                      active ? 'bg-blue-50' : ''
                    }`}
                    onMouseEnter={() => setFocusedIndex(idx)}
                    onMouseDown={(e) => e.preventDefault()} // keep focus
                    onClick={() => fetchDetails(p.place_id, p.description)}
                  >
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {p.structured_formatting.main_text}
                        </div>
                        {p.structured_formatting.secondary_text && (
                          <div className="text-sm text-gray-500 truncate">
                            {p.structured_formatting.secondary_text}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {!isLoaded && !loadingError && (
        <p className="text-xs text-muted-foreground">Loading Google Maps…</p>
      )}
    </div>
  );
};

export default PlacesAutocomplete;

