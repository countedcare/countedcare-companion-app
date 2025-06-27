
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { MapPin, Calculator } from 'lucide-react';

interface MileageCalculatorProps {
  onAmountCalculated: (amount: number) => void;
  initialMiles?: number;
  initialRate?: number;
}

const MileageCalculator: React.FC<MileageCalculatorProps> = ({
  onAmountCalculated,
  initialMiles = 0,
  initialRate = 0.21 // 2024 IRS standard mileage rate
}) => {
  const [miles, setMiles] = useState(initialMiles.toString());
  const [rate, setRate] = useState(initialRate.toString());
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');
  const [calculatedAmount, setCalculatedAmount] = useState(0);

  useEffect(() => {
    const milesNum = parseFloat(miles) || 0;
    const rateNum = parseFloat(rate) || 0;
    const amount = milesNum * rateNum;
    setCalculatedAmount(amount);
    onAmountCalculated(amount);
  }, [miles, rate, onAmountCalculated]);

  const handleCalculateAmount = () => {
    const milesNum = parseFloat(miles) || 0;
    const rateNum = parseFloat(rate) || 0;
    const amount = milesNum * rateNum;
    onAmountCalculated(amount);
  };

  return (
    <div className="space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-blue-600" />
        <h4 className="font-medium text-blue-900">Mileage Calculator</h4>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start-location">From (Optional)</Label>
          <Input
            id="start-location"
            placeholder="Starting location"
            value={startLocation}
            onChange={(e) => setStartLocation(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="end-location">To (Optional)</Label>
          <Input
            id="end-location"
            placeholder="Destination"
            value={endLocation}
            onChange={(e) => setEndLocation(e.target.value)}
          />
        </div>
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
