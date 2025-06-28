
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { MapPin, Calculator, Route } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import PlacesAutocomplete from '@/components/places/PlacesAutocomplete';

interface MileageCalculatorProps {
  onAmountCalculated: (amount: number) => void;
  initialMiles?: number;
  initialRate?: number;
  apiKey: string;
}

const MileageCalculator: React.FC<MileageCalculatorProps> = ({
  onAmountCalculated,
  initialMiles = 0,
  initialRate = 0.67, // 2024 IRS standard mileage rate updated
  apiKey
}) => {
  const { toast } = useToast();
  const [miles, setMiles] = useState(initialMiles.toString());
  const [rate, setRate] = useState(initialRate.toString());
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');
  const [startPlace, setStartPlace] = useState<google.maps.places.PlaceResult | null>(null);
  const [endPlace, setEndPlace] = useState<google.maps.places.PlaceResult | null>(null);
  const [calculatedAmount, setCalculatedAmount] = useState(0);
  const [isCalculatingDistance, setIsCalculatingDistance] = useState(false);

  useEffect(() => {
    const milesNum = parseFloat(miles) || 0;
    const rateNum = parseFloat(rate) || 0;
    const amount = milesNum * rateNum;
    setCalculatedAmount(amount);
    onAmountCalculated(amount);
  }, [miles, rate, onAmountCalculated]);

  const handleStartLocationSelect = (place: google.maps.places.PlaceResult) => {
    setStartPlace(place);
    setStartLocation(place.formatted_address || place.name || '');
  };

  const handleEndLocationSelect = (place: google.maps.places.PlaceResult) => {
    setEndPlace(place);
    setEndLocation(place.formatted_address || place.name || '');
  };

  const calculateDistanceUsingPlaces = () => {
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
            const distanceText = element.distance?.text || '';
            const distanceValue = element.distance?.value || 0; // in meters
            const distanceInMiles = (distanceValue * 0.000621371).toFixed(1);

            setMiles(distanceInMiles);
            
            toast({
              title: "Distance Calculated!",
              description: `${distanceText} (${distanceInMiles} miles) between your locations.`,
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
            description: "Unable to calculate distance. Please enter miles manually.",
            variant: "destructive"
          });
        }
      });
    } catch (error) {
      setIsCalculatingDistance(false);
      console.error('Distance calculation error:', error);
      toast({
        title: "Service Unavailable",
        description: "Distance calculation service is not available. Please enter miles manually.",
        variant: "destructive"
      });
    }
  };

  const canCalculateDistance = startPlace && endPlace && window.google?.maps?.DistanceMatrixService;

  return (
    <div className="space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-blue-600" />
        <h4 className="font-medium text-blue-900">Mileage Calculator</h4>
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
          onClick={calculateDistanceUsingPlaces}
          disabled={isCalculatingDistance || !canCalculateDistance}
          className="flex items-center gap-2"
          variant="outline"
        >
          <Route className="h-4 w-4" />
          {isCalculatingDistance ? 'Calculating...' : 'Calculate Distance'}
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="miles">Miles Driven*</Label>
          <Input
            id="miles"
            type="number"
            placeholder="0"
            step="0.1"
            min="0"
            value={miles}
            onChange={(e) => setMiles(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="rate">Rate per Mile ($)</Label>
          <Input
            id="rate"
            type="number"
            placeholder="0.67"
            step="0.01"
            min="0"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
          />
          <p className="text-xs text-blue-600">2024 IRS standard rate: $0.67/mile</p>
        </div>
      </div>
      
      {calculatedAmount > 0 && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calculator className="h-4 w-4 text-green-600" />
              <span className="font-medium text-green-900">Calculated Amount:</span>
            </div>
            <span className="text-lg font-bold text-green-900">
              ${calculatedAmount.toFixed(2)}
            </span>
          </div>
          <p className="text-sm text-green-700 mt-1">
            {miles} miles × ${rate}/mile = ${calculatedAmount.toFixed(2)}
          </p>
        </div>
      )}
    </div>
  );
};

export default MileageCalculator;
