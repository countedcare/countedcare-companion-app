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
const DEBOUNCE_DELAY = 300;

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
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [inputValue, setInputValue] = useState(value);
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  // Keep internal input in sync with prop
  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  // Load Google Maps JS (Places) once, robustly
  useEffect(() => {
    if (!apiKey) {
      const error = 'Google Maps API key is required';
      setLoadingError(error);
      toast({
        variant: "destructive",
        title: "Configuration Error",
        description: error,
      });
      return;
    }

    // Already loaded?
    if (window.google?.maps?.places) {
      setIsLoaded(true);
      return;
    }

    // Existing loader?
    const existing = document.querySelector<HTMLScriptElement>(`script[${LOAD_ATTR}="true"]`);
    if (existing) {
      const handleLoad = () => {
        if (window.google?.maps?.places) {
          setIsLoaded(true);
        } else {
          const error = 'Google Maps Places library did not initialize';
          setLoadingError(error);
          toast({
            variant: "destructive",
            title: "Google Maps Error",
            description: error,
          });
        }
      };
      
      const handleError = () => {
        const error = 'Failed to load Google Maps API';
        setLoadingError(error);
        toast({
          variant: "destructive",
          title: "Google Maps Error",
          description: error,
        });
      };

      existing.addEventListener('load', handleLoad);
      existing.addEventListener('error', handleError);
      
      return () => {
        existing.removeEventListener('load', handleLoad);
        existing.removeEventListener('error', handleError);
      };
    }

    // Create new script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.setAttribute(LOAD_ATTR, 'true');

    script.onload = () => {
      if (window.google?.maps?.places) {
        setIsLoaded(true);
      } else {
        const error = 'Google Maps Places library did not initialize';
        setLoadingError(error);
        toast({
          variant: "destructive",
          title: "Google Maps Error",
          description: error,
        });
      }
    };

    script.onerror = () => {
      const error = 'Failed to load Google Maps API';
      setLoadingError(error);
      toast({
        variant: "destructive",
        title: "Google Maps Error",
        description: error,
      });
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup timeout on unmount
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [apiKey, toast]);

  // Initialize services when library is ready
  useEffect(() => {
    if (!isLoaded || !window.google?.maps?.places) return;

    try {
      if (!autocompleteServiceRef.current) {
        autocompleteServiceRef.current = new google.maps.places.AutocompleteService();
      }
      if (!placesServiceRef.current) {
        const dummy = document.createElement('div');
        placesServiceRef.current = new google.maps.places.PlacesService(dummy);
      }
    } catch (error) {
      console.error('Failed to initialize Google Maps services:', error);
      const errorMsg = 'Failed to initialize Google Maps services';
      setLoadingError(errorMsg);
      toast({
        variant: "destructive",
        title: "Google Maps Error",
        description: errorMsg,
      });
    }
  }, [isLoaded, toast]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!dropdownRef.current || !inputRef.current) return;
      const target = e.target as Node;
      if (!dropdownRef.current.contains(target) && !inputRef.current.contains(target)) {
        setOpen(false);
        setFocusedIndex(-1);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open]);

  // Debounced search function
  const debouncedSearch = useCallback((query: string) => {
    // Clear any existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    if (!query.trim()) {
      setPredictions([]);
      setOpen(false);
      setIsSearching(false);
      return;
    }

    if (!isLoaded || !autocompleteServiceRef.current || loadingError) {
      return;
    }

    setIsSearching(true);

    debounceTimeoutRef.current = setTimeout(() => {
      const request: google.maps.places.AutocompletionRequest = {
        input: query.trim(),
        types: types as any,
      };

      if (country) {
        request.componentRestrictions = {
          country: Array.isArray(country) ? country : [country],
        } as any;
      }

      autocompleteServiceRef.current!.getPlacePredictions(request, (preds, status) => {
        setIsSearching(false);
        
        if (status === google.maps.places.PlacesServiceStatus.OK && preds && preds.length > 0) {
          const formattedPredictions = preds.map((p) => ({
            place_id: p.place_id!,
            description: p.description!,
            structured_formatting: {
              main_text: p.structured_formatting?.main_text || p.description!,
              secondary_text: p.structured_formatting?.secondary_text,
            },
          }));
          
          setPredictions(formattedPredictions);
          setOpen(true);
          setFocusedIndex(-1);
        } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS || !preds?.length) {
          setPredictions([]);
          setOpen(false);
          if (query.length > 2) {
            toast({
              title: "No Results",
              description: "No places found matching your search. Try a different address.",
            });
          }
        } else {
          console.warn('Places prediction failed:', status);
          setPredictions([]);
          setOpen(false);
          if (status !== google.maps.places.PlacesServiceStatus.INVALID_REQUEST) {
            toast({
              variant: "destructive",
              title: "Search Error",
              description: "Failed to search for places. Please try again.",
            });
          }
        }
      });
    }, DEBOUNCE_DELAY);
  }, [isLoaded, types, country, toast, loadingError]);

  // Handle input changes with debounced search
  useEffect(() => {
    debouncedSearch(inputValue);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [inputValue, debouncedSearch]);

  const fetchDetails = useCallback(
    (placeId: string, description: string) => {
      if (!placesServiceRef.current) {
        // No details service - fall back to prediction description
        onPlaceSelect({ formatted_address: description, place_id: placeId });
        setInputValue(description);
        setOpen(false);
        setFocusedIndex(-1);
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
            console.warn('getDetails failed, using fallback:', status);
            // Fall back to description if getDetails fails
            onPlaceSelect({ formatted_address: description, place_id: placeId });
            setInputValue(description);
            
            if (status !== google.maps.places.PlacesServiceStatus.NOT_FOUND) {
              toast({
                title: "Location Details",
                description: "Used basic location info as detailed data was unavailable.",
              });
            }
          }
          setOpen(false);
          setFocusedIndex(-1);
        }
      );
    },
    [onPlaceSelect, toast]
  );

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (!open || predictions.length === 0) {
      if (e.key === 'Escape') {
        setOpen(false);
        setFocusedIndex(-1);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex((i) => (i < predictions.length - 1 ? i + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex((i) => (i > 0 ? i - 1 : predictions.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < predictions.length) {
          const prediction = predictions[focusedIndex];
          fetchDetails(prediction.place_id, prediction.description);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setOpen(false);
        setFocusedIndex(-1);
        break;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // Clear dropdown if input is empty
    if (!newValue.trim()) {
      setOpen(false);
      setPredictions([]);
      setFocusedIndex(-1);
    }
  };

  const handleInputFocus = () => {
    // Only open if we have predictions and input has content
    if (inputValue.trim() && predictions.length > 0 && !loadingError) {
      setOpen(true);
    }
  };

  const handlePredictionClick = (prediction: PlacePrediction) => {
    fetchDetails(prediction.place_id, prediction.description);
  };

  const shouldShowFallback = !!loadingError;

  return (
    <div className={`space-y-2 relative ${className}`}>
      {label && <Label htmlFor="places-input">{label}</Label>}

      <div className="relative">
        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        {shouldShowFallback && (
          <AlertCircle className="absolute right-3 top-3 h-4 w-4 text-orange-500" />
        )}
        {!shouldShowFallback && isSearching && (
          <Loader2 className="absolute right-3 top-3 h-4 w-4 text-muted-foreground animate-spin" />
        )}
        
        <Input
          ref={inputRef}
          id="places-input"
          type="text"
          autoComplete="off"
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-10"
          disabled={!shouldShowFallback && !isLoaded}
        />

        {/* Dropdown */}
        {open && predictions.length > 0 && !shouldShowFallback && (
          <div
            ref={dropdownRef}
            className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-lg z-50 max-h-60 overflow-y-auto"
          >
            {predictions.map((prediction, idx) => {
              const isActive = idx === focusedIndex;
              return (
                <button
                  type="button"
                  key={prediction.place_id}
                  className={`w-full text-left p-3 border-b border-border last:border-b-0 hover:bg-accent transition-colors ${
                    isActive ? 'bg-accent' : ''
                  }`}
                  onMouseEnter={() => setFocusedIndex(idx)}
                  onMouseDown={(e) => e.preventDefault()} // Prevent losing focus
                  onClick={() => handlePredictionClick(prediction)}
                >
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <div className="font-medium text-foreground truncate">
                        {prediction.structured_formatting.main_text}
                      </div>
                      {prediction.structured_formatting.secondary_text && (
                        <div className="text-sm text-muted-foreground truncate">
                          {prediction.structured_formatting.secondary_text}
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

      {/* Status messages */}
      {shouldShowFallback && (
        <p className="text-xs text-orange-600 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          Google Maps not available. Please type the full address manually.
        </p>
      )}
      
      {!isLoaded && !loadingError && (
        <p className="text-xs text-muted-foreground">Loading Google Maps…</p>
      )}
    </div>
  );
};

export default PlacesAutocomplete;

