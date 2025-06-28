
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MapPin, Calculator, Route } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import PlacesAutocomplete from '@/components/places/PlacesAutocomplete';

interface MileageCalculatorProps {
  onAmountCalculated: (amount: number) => void;
  apiKey: string;
}

const MileageCalculator: React.FC<MileageCalculatorProps> = ({
  onAmountCalculated,
  apiKey
}) => {
  const { toast } = useToast();
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');
  const [startPlace, setStartPlace] = useState<google.maps.places.PlaceResult | null>(null);
  const [endPlace, setEndPlace] = useState<google.maps.places.PlaceResult | null>(null);
  const [calculatedAmount, setCalculatedAmount] = useState(0);
  const [calculatedMiles, setCalculatedMiles] = useState(0);
  const [isCalculatingDistance, setIsCalculatingDistance] = useState(false);
  
  const IRS_RATE = 0.67; // 2024 IRS standard mileage rate

  const handleStartLocationSelect = (place: google.maps.places.PlaceResult) => {
    setStartPlace(place);
    setStartLocation(place.formatted_address || place.name || '');
  };

  const handleEndLocationSelect = (place: google.maps.places.PlaceResult) => {
    setEndPlace(place);
    setEndLocation(place.formatted_address || place.name || '');
  };

  const calculateDistanceAndAmount = () => {
    if (!startPlace?.geometry?.location || !endPlace?.geometry?.location) {
      toast({
        title: "Location Error",
        description: "Please select valid locations from the dropdown suggestions.",
        variant: "destructive"
      });
      return;
    }

    setIsCalculatingDistance(true);

    try {
      const service = new google.maps.DistanceMatrixService();
      
      service.getDistanceMatrix({
        origins: [startPlace.geometry.location],
        destinations: [endPlace.geometry.location],
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.IMPERIAL,
        avoidHighways: false,
        avoidTolls: false
      }, (response, status) => {
        setIsCalculatingDistance(false);
        
        if (status === google.maps.DistanceMatrixStatus.OK && response) {
          const element = response.rows[0]?.elements[0];
          if (element?.status === google.maps.DistanceMatrixElementStatus.OK) {
            const distanceValue = element.distance?.value || 0; // in meters
            const distanceInMiles = distanceValue * 0.000621371; // Convert to miles
            const roundedMiles = Math.round(distanceInMiles * 10) / 10; // Round to 1 decimal
            const amount = roundedMiles * IRS_RATE;

            setCalculatedMiles(roundedMiles);
            setCalculatedAmount(amount);
            onAmountCalculated(amount);
            
            toast({
              title: "Distance Calculated!",
              description: `${roundedMiles} miles at $${IRS_RATE}/mile = $${amount.toFixed(2)}`,
            });
          } else {
            toast({
              title: "Route Not Found",
              description: "Could not find a driving route between these locations.",
              variant: "destructive"
            });
          }
        } else {
          toast({
            title: "Distance Calculation Failed",
            description: "Unable to calculate distance. Please try again.",
            variant: "destructive"
          });
        }
      });
    } catch (error) {
      setIsCalculatingDistance(false);
      console.error('Distance calculation error:', error);
      toast({
        title: "Service Unavailable",
        description: "Distance calculation service is not available. Please try again.",
        variant: "destructive"
      });
    }
  };

  const canCalculateDistance = startPlace && endPlace && window.google?.maps?.DistanceMatrixService;

  return (
    <div className="space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-blue-600" />
        <h4 className="font-medium text-blue-900">Track Mileage</h4>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PlacesAutocomplete
          onPlaceSelect={handleStartLocationSelect}
          placeholder="Enter starting address..."
          label="From"
          value={startLocation}
          apiKey={apiKey}
          types={['geocode', 'establishment']}
        />
        
        <PlacesAutocomplete
          onPlaceSelect={handleEndLocationSelect}
          placeholder="Enter destination address..."
          label="To"
          value={endLocation}
          apiKey={apiKey}
          types={['geocode', 'establishment']}
        />
      </div>

      <div className="flex justify-center">
        <Button
          type="button"
          onClick={calculateDistanceAndAmount}
          disabled={isCalculatingDistance || !canCalculateDistance}
          className="flex items-center gap-2"
          variant="outline"
        >
          <Route className="h-4 w-4" />
          {isCalculatingDistance ? 'Calculating...' : 'Calculate Mileage'}
        </Button>
      </div>
      
      {calculatedAmount > 0 && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calculator className="h-4 w-4 text-green-600" />
              <span className="font-medium text-green-900">Deductible Amount:</span>
            </div>
            <span className="text-lg font-bold text-green-900">
              ${calculatedAmount.toFixed(2)}
            </span>
          </div>
          <p className="text-sm text-green-700 mt-1">
            {calculatedMiles} miles × ${IRS_RATE}/mile (2024 IRS rate)
          </p>
        </div>
      )}
      
      <p className="text-xs text-blue-600">
        * Based on 2024 IRS standard mileage rate of ${IRS_RATE} per mile
      </p>
    </div>
  );
};

export default MileageCalculator;
