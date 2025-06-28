
import React, { useRef, useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin } from 'lucide-react';

interface PlacesAutocompleteProps {
  onPlaceSelect: (place: google.maps.places.PlaceResult) => void;
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
  const [inputValue, setInputValue] = useState(value);
  const [isLoaded, setIsLoaded] = useState(false);
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [loadingError, setLoadingError] = useState<string | null>(null);

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
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps`;
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
      };
      
      document.head.appendChild(script);
    };

    if (apiKey) {
      loadGoogleMapsScript();
    } else {
      setLoadingError('API key is required');
    }
  }, [apiKey]);

  useEffect(() => {
    if (isLoaded && inputRef.current && !autocomplete && window.google?.maps?.places) {
      try {
        console.log('Initializing autocomplete with types:', types);
        const autocompleteInstance = new google.maps.places.Autocomplete(inputRef.current, {
          types: types,
          fields: ['place_id', 'name', 'formatted_address', 'geometry', 'types', 'photos']
        });

        autocompleteInstance.addListener('place_changed', () => {
          const place = autocompleteInstance.getPlace();
          console.log('Place selected:', place);
          if (place.place_id) {
            onPlaceSelect(place);
            setInputValue(place.formatted_address || place.name || '');
          }
        });

        setAutocomplete(autocompleteInstance);
        console.log('Autocomplete initialized successfully');
      } catch (error) {
        console.error('Error initializing autocomplete:', error);
        setLoadingError('Error initializing autocomplete');
      }
    }
  }, [isLoaded, onPlaceSelect, types, autocomplete]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Input changed:', e.target.value);
    setInputValue(e.target.value);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && <Label htmlFor="places-input">{label}</Label>}
      <div className="relative">
        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          id="places-input"
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          className="pl-10"
          disabled={!isLoaded}
        />
      </div>
      {!isLoaded && !loadingError && (
        <p className="text-xs text-muted-foreground">Loading Google Maps...</p>
      )}
      {loadingError && (
        <p className="text-xs text-red-500">Error: {loadingError}</p>
      )}
      {isLoaded && (
        <p className="text-xs text-green-600">Google Maps loaded successfully</p>
      )}
    </div>
  );
};

export default PlacesAutocomplete;
