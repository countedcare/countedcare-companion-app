
import React from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import MedicalPlacesAutocomplete from '@/components/places/MedicalPlacesAutocomplete';

interface ExpenseLocationSectionProps {
  selectedLocation: google.maps.places.PlaceResult | null;
  setSelectedLocation: (location: google.maps.places.PlaceResult | null) => void;
  title: string;
  setTitle: (title: string) => void;
  apiKey: string;
}

const ExpenseLocationSection: React.FC<ExpenseLocationSectionProps> = ({
  selectedLocation,
  setSelectedLocation,
  title,
  setTitle,
  apiKey
}) => {
  const { toast } = useToast();

  const handleLocationSelect = (place: google.maps.places.PlaceResult) => {
    setSelectedLocation(place);
    console.log('Selected location:', place);
    
    // Auto-populate title if it's empty
    if (!title && place.name) {
      setTitle(place.name);
    }
    
    toast({
      title: "Location Selected",
      description: `Added ${place.name || place.formatted_address} to your expense`
    });
  };

  return (
    <div className="space-y-2">
      <MedicalPlacesAutocomplete
        onPlaceSelect={handleLocationSelect}
        apiKey={apiKey}
      />
      
      {selectedLocation && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-medium text-blue-900">
                {selectedLocation.name}
              </h4>
              <p className="text-sm text-blue-700 mt-1">
                {selectedLocation.formatted_address}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setSelectedLocation(null)}
              className="text-blue-600 hover:text-blue-800"
            >
              Remove
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseLocationSection;
