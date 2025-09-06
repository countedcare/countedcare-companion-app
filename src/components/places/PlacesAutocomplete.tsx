
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
    secondary_text: string;
  };
}

interface PlacesAutocompleteProps {
  onPlaceSelect: (place: { formatted_address: string; place_id: string }) => void;
  placeholder?: string;
  label?: string;
  value?: string;
  apiKey: string;
  types?: string[];
  className?: string;
}

const PlacesAutocomplete: React.FC<PlacesAutocompleteProps> = ({
  onPlaceSelect,
  placeholder = "Search for a location...",
  label,
  value = "",
  apiKey,
  types = ['establishment', 'geocode'],
  className = ""
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null);
  const { toast } = useToast();
  
  const [inputValue, setInputValue] = useState(value);
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  useEffect(() => {
    const loadGoogleMapsScript = () => {
      console.log('Attempting to load Google Maps API with key:', apiKey ? 'Key provided' : 'No key');
      
      if (window.google?.maps?.places) {
        console.log('Google Maps API already loaded');
        setIsLoaded(true);
        return;
      }

      if (!apiKey) {
        console.error('No API key provided');
        setLoadingError('No API key provided');
        return;
      }

      // Remove existing scripts to avoid conflicts
      const existingScripts = document.querySelectorAll('script[src*="maps.googleapis.com"]');
      existingScripts.forEach(script => script.remove());

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps&loading=async`;
      script.async = true;
      script.defer = true;
      
      // Add global callback
      (window as any).initGoogleMaps = () => {
        console.log('Google Maps API loaded successfully');
        setIsLoaded(true);
        setLoadingError(null);
      };
      
        script.onerror = (error) => {
          console.error('Failed to load Google Maps API:', error);
          setLoadingError('Failed to load Google Maps API');
          setShowFallback(true);
          toast({
            title: "Google Maps Unavailable",
            description: "Using manual address input. You can still enter addresses manually.",
            variant: "destructive"
          });
        };
      
      document.head.appendChild(script);
    };

    if (apiKey) {
      loadGoogleMapsScript();
    } else {
      setLoadingError('API key is required');
      setShowFallback(true);
      toast({
        title: "Google Maps Not Configured",
        description: "Please configure Google Maps API or use manual address input.",
        variant: "destructive"
      });
    }
  }, [apiKey]);

  useEffect(() => {
    if (isLoaded && window.google?.maps?.places) {
      autocompleteServiceRef.current = new google.maps.places.AutocompleteService();
      
      // Create a dummy map and places service for place details
      const mapDiv = document.createElement('div');
      const map = new google.maps.Map(mapDiv);
      placesServiceRef.current = new google.maps.places.PlacesService(map);
    }
  }, [isLoaded]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchPlaces = useCallback(async (query: string) => {
    if (!autocompleteServiceRef.current || !query.trim()) {
      setPredictions([]);
      setShowDropdown(false);
      return;
    }

    setIsLoading(true);
    try {
      const request = {
        input: query,
        types: types,
      };

      autocompleteServiceRef.current.getPlacePredictions(request, (predictions, status) => {
        setIsLoading(false);
        if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
          if (predictions.length === 0) {
            toast({
              title: "No Results Found",
              description: "No addresses found for your search. Try a different search term or enter manually.",
              variant: "destructive"
            });
            setShowFallback(true);
          }
          setPredictions(predictions.map(p => ({
            place_id: p.place_id,
            description: p.description,
            structured_formatting: p.structured_formatting
          })));
          setShowDropdown(predictions.length > 0);
          setSelectedIndex(-1);
        } else {
          console.error('Places prediction failed:', status);
          toast({
            title: "Search Failed",
            description: "Unable to search for addresses. You can enter the address manually.",
            variant: "destructive"
          });
          setPredictions([]);
          setShowDropdown(false);
          setShowFallback(true);
        }
      });
    } catch (error) {
      console.error('Error searching places:', error);
      setIsLoading(false);
      setPredictions([]);
      setShowDropdown(false);
      toast({
        title: "Search Error",
        description: "An error occurred while searching. Please try again or enter manually.",
        variant: "destructive"
      });
      setShowFallback(true);
    }
  }, [types]);

  const selectPlace = useCallback(async (placeId: string, description: string) => {
    if (!placesServiceRef.current) return;

    try {
      const request = {
        placeId: placeId,
        fields: ['formatted_address', 'place_id']
      };

      placesServiceRef.current.getDetails(request, (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place) {
          onPlaceSelect({
            formatted_address: place.formatted_address || description,
            place_id: place.place_id || placeId
          });
          setInputValue(place.formatted_address || description);
        } else {
          console.error('Failed to get place details:', status);
          toast({
            title: "Location Details Unavailable",
            description: "Using basic address information.",
            variant: "destructive"
          });
          // Fallback to using the description
          onPlaceSelect({
            formatted_address: description,
            place_id: placeId
          });
          setInputValue(description);
        }
      });
    } catch (error) {
      console.error('Error getting place details:', error);
      toast({
        title: "Error Getting Location",
        description: "Using basic address information.",
        variant: "destructive"
      });
      // Fallback to using the description
      onPlaceSelect({
        formatted_address: description,
        place_id: placeId
      });
      setInputValue(description);
    }

    setShowDropdown(false);
    setPredictions([]);
    setSelectedIndex(-1);
  }, [onPlaceSelect]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    // Debounce the search
    const timeoutId = setTimeout(() => {
      searchPlaces(value);
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || predictions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < predictions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          const prediction = predictions[selectedIndex];
          selectPlace(prediction.place_id, prediction.description);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleManualInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    // Reset dropdown when typing manually
    setShowDropdown(false);
    setPredictions([]);
  };

  const handlePredictionClick = (prediction: PlacePrediction) => {
    selectPlace(prediction.place_id, prediction.description);
  };
  const shouldShowFallback = !isLoaded || loadingError || showFallback;

  return (
    <div className={`space-y-2 relative ${className}`}>
      {label && <Label htmlFor="places-input">{label}</Label>}
      
      {shouldShowFallback ? (
        // Fallback manual input
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
            onChange={handleManualInput}
            className="pl-10 pr-10"
          />
        </div>
      ) : (
        // Google Maps autocomplete
        <div className="relative">
          <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          {isLoading && (
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
            onKeyDown={handleKeyDown}
            onFocus={() => inputValue && searchPlaces(inputValue)}
            className="pl-10 pr-10"
            disabled={!isLoaded}
          />
          
          {/* Dropdown */}
          {showDropdown && predictions.length > 0 && (
            <div 
              ref={dropdownRef}
              className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto"
            >
              {predictions.map((prediction, index) => (
                <div
                  key={prediction.place_id}
                  className={`p-3 cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors ${
                    index === selectedIndex ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                  onClick={() => handlePredictionClick(prediction)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {prediction.structured_formatting.main_text}
                      </div>
                      {prediction.structured_formatting.secondary_text && (
                        <div className="text-sm text-gray-500 truncate">
                          {prediction.structured_formatting.secondary_text}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Status messages */}
      {!isLoaded && !loadingError && (
        <p className="text-xs text-muted-foreground">Loading Google Maps...</p>
      )}
      {shouldShowFallback && (
        <p className="text-xs text-orange-600 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          Manual input mode - Google Maps unavailable
        </p>
      )}
    </div>
  );
};

export default PlacesAutocomplete;
