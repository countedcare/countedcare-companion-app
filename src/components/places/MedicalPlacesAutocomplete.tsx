
import React from 'react';
import PlacesAutocomplete from './PlacesAutocomplete';

interface MedicalPlacesAutocompleteProps {
  onPlaceSelect: (place: google.maps.places.PlaceResult) => void;
  value?: string;
  apiKey: string;
  className?: string;
}

const MedicalPlacesAutocomplete: React.FC<MedicalPlacesAutocompleteProps> = ({
  onPlaceSelect,
  value,
  apiKey,
  className
}) => {
  // Focus on medical and caregiving-related establishments
  const medicalTypes = [
    'hospital',
    'pharmacy',
    'doctor',
    'dentist',
    'physiotherapist',
    'health',
    'establishment'
  ];

  const handlePlaceSelect = (place: google.maps.places.PlaceResult) => {
    console.log('Selected medical facility:', place);
    onPlaceSelect(place);
  };

  return (
    <PlacesAutocomplete
      onPlaceSelect={handlePlaceSelect}
      placeholder="Search for medical facilities, pharmacies, hospitals..."
      label="Location (Optional)"
      value={value}
      apiKey={apiKey}
      types={medicalTypes}
      className={className}
    />
  );
};

export default MedicalPlacesAutocomplete;
