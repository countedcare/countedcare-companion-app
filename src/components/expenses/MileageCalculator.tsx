
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { MapPin, Calculator, Route } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface MileageCalculatorProps {
  onAmountCalculated: (amount: number) => void;
  initialMiles?: number;
  initialRate?: number;
  apiKey: string;
}

const MileageCalculator: React.FC<MileageCalculatorProps> = ({
  onAmountCalculated,
  initialMiles = 0,
  initialRate = 0.21, // 2024 IRS standard mileage rate
  apiKey
}) => {
  const { toast } = useToast();
  const [miles, setMiles] = useState(initialMiles.toString());
  const [rate, setRate] = useState(initialRate.toString());
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');
  const [calculatedAmount, setCalculatedAmount] = useState(0);
  const [isCalculatingDistance, setIsCalculatingDistance] = useState(false);

  useEffect(() => {
    const milesNum = parseFloat(miles) || 0;
    const rateNum = parseFloat(rate) || 0;
    const amount = milesNum * rateNum;
    setCalculatedAmount(amount);
    onAmountCalculated(amount);
  }, [miles, rate, onAmountCalculated]);

  const calculateDistance = async () => {
    if (!startLocation.trim() || !endLocation.trim()) {
      toast({
        title: "Missing Locations",
        description: "Please enter both starting and destination locations.",
        variant: "destructive"
      });
      return;
    }

    if (!apiKey) {
      toast({
        title: "API Key Missing",
        description: "Google Maps API key is required for distance calculation.",
        variant: "destructive"
      });
      return;
    }

    setIsCalculatingDistance(true);

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(startLocation)}&destinations=${encodeURIComponent(endLocation)}&units=imperial&key=${apiKey}&mode=driving`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch distance data');
      }

      const data = await response.json();

      if (data.status === 'OK' && data.rows[0]?.elements[0]?.status === 'OK') {
        const element = data.rows[0].elements[0];
        const distanceText = element.distance.text;
        const distanceValue = element.distance.value; // in meters
        const distanceInMiles = (distanceValue * 0.000621371).toFixed(1); // Convert meters to miles

        setMiles(distanceInMiles);
        
        toast({
          title: "Distance Calculated!",
          description: `${distanceText} (${distanceInMiles} miles) between your locations.`,
        });
      } else {
        throw new Error(data.error_message || 'Could not calculate distance between locations');
      }
    } catch (error) {
      console.error('Distance calculation error:', error);
      toast({
        title: "Distance Calculation Failed",
        description: "Could not calculate distance. Please enter miles manually.",
        variant: "destructive"
      });
    } finally {
      setIsCalculatingDistance(false);
    }
  };

  return (
    <div className="space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-blue-600" />
        <h4 className="font-medium text-blue-900">Mileage Calculator</h4>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start-location">From</Label>
          <Input
            id="start-location"
            placeholder="Starting location"
            value={startLocation}
            onChange={(e) => setStartLocation(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="end-location">To</Label>
          <Input
            id="end-location"
            placeholder="Destination"
            value={endLocation}
            onChange={(e) => setEndLocation(e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-center">
        <Button
          type="button"
          onClick={calculateDistance}
          disabled={isCalculatingDistance || !startLocation.trim() || !endLocation.trim()}
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
            placeholder="0.21"
            step="0.01"
            min="0"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
          />
          <p className="text-xs text-blue-600">2024 IRS standard rate: $0.21/mile</p>
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
