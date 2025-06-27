
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

  useEffect(() => {
    const loadGoogleMapsScript = () => {
      if (window.google?.maps?.places) {
        setIsLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => setIsLoaded(true);
      document.head.appendChild(script);
    };

    if (apiKey) {
      loadGoogleMapsScript();
    }
  }, [apiKey]);

  useEffect(() => {
    if (isLoaded && inputRef.current && !autocomplete) {
      const autocompleteInstance = new google.maps.places.Autocomplete(inputRef.current, {
        types: types,
        fields: ['place_id', 'name', 'formatted_address', 'geometry', 'types', 'photos']
      });

      autocompleteInstance.addListener('place_changed', () => {
        const place = autocompleteInstance.getPlace();
        if (place.place_id) {
          onPlaceSelect(place);
          setInputValue(place.formatted_address || place.name || '');
        }
      });

      setAutocomplete(autocompleteInstance);
    }
  }, [isLoaded, onPlaceSelect, types, autocomplete]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      {!isLoaded && (
        <p className="text-xs text-muted-foreground">Loading Google Maps...</p>
      )}
    </div>
  );
};

export default PlacesAutocomplete;
