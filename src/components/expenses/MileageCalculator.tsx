import React, { useState } from 'react';
import { MapPin, Calculator, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface MileageCalculatorProps {
  onAmountCalculated: (amount: number) => void;
  apiKey?: string;
}

interface MileageResult {
  from: string;
  to: string;
  distance: {
    miles: number;
    text: string;
  };
  duration?: {
    text: string;
    minutes: number;
  };
  estimatedDeduction: number;
  irsRate: number;
}

const MileageCalculator: React.FC<MileageCalculatorProps> = ({ onAmountCalculated }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [fromAddress, setFromAddress] = useState('');
  const [toAddress, setToAddress] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [result, setResult] = useState<MileageResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRoundTrip, setIsRoundTrip] = useState(false);

  const calculateMileage = async () => {
    if (!fromAddress.trim() || !toAddress.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter both 'From' and 'To' addresses.",
        variant: "destructive"
      });
      return;
    }

    setIsCalculating(true);
    setError(null);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('calculate-mileage', {
        body: {
          from: fromAddress.trim(),
          to: toAddress.trim()
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to calculate mileage');
      }

      // Edge function returns { miles, deduction }
      const baseMiles = typeof data?.miles === 'number' ? Math.round(data.miles * 10) / 10 : 0;
      const appliedMiles = isRoundTrip ? Math.round(baseMiles * 2 * 10) / 10 : baseMiles;
      const computedDeduction = Math.round(appliedMiles * 0.21 * 100) / 100;

      const resultPayload: MileageResult = {
        from: fromAddress.trim(),
        to: toAddress.trim(),
        distance: { miles: appliedMiles, text: `${appliedMiles} miles` },
        estimatedDeduction: computedDeduction,
        irsRate: 0.21
      };

      setResult(resultPayload);
      onAmountCalculated(computedDeduction);
      
      toast({
        title: "Mileage Calculated!",
        description: `Distance: ${appliedMiles} miles • Total: $${computedDeduction}${isRoundTrip ? ' (round trip)' : ''}`
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      
      toast({
        title: "Calculation Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const saveMileageLog = async () => {
    if (!user || !result) return;

    setIsSaving(true);
    
    try {
      const { error } = await supabase
        .from('expenses')
        .insert({
          user_id: user.id,
          amount: result.estimatedDeduction,
          category: '🚘 Transportation & Travel for Medical Care',
          description: `Mileage: ${result.from} to ${result.to}`,
          date: new Date().toISOString().split('T')[0],
          is_tax_deductible: true,
          notes: `Distance: ${result.distance.miles} miles at $${result.irsRate}/mile IRS rate`
        });

      if (error) throw error;

      toast({
        title: "Mileage Log Saved!",
        description: "Your mileage expense has been added to your records."
      });

    } catch (err) {
      console.error('Error saving mileage log:', err);
      toast({
        title: "Save Failed",
        description: "Could not save mileage log. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-blue-600" />
        <h4 className="font-medium text-blue-900">Track Mileage</h4>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <Label htmlFor="from-address" className="text-sm font-medium">From Address</Label>
          <Input
            id="from-address"
            placeholder="Enter starting address"
            value={fromAddress}
            onChange={(e) => setFromAddress(e.target.value)}
            className="bg-white"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="to-address" className="text-sm font-medium">To Address</Label>
          <Input
            id="to-address"
            placeholder="Enter destination address"
            value={toAddress}
            onChange={(e) => setToAddress(e.target.value)}
            className="bg-white"
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="round-trip" className="text-sm font-medium">Round trip</Label>
        <Switch id="round-trip" checked={isRoundTrip} onCheckedChange={setIsRoundTrip} />
      </div>

      <Button
        onClick={calculateMileage}
        disabled={isCalculating || !fromAddress.trim() || !toAddress.trim()}
        className="w-full"
      >
        {isCalculating ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Calculating...
          </>
        ) : (
          <>
            <Calculator className="h-4 w-4 mr-2" />
            Calculate Mileage
          </>
        )}
      </Button>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <div className="space-y-3 p-4 bg-green-50 border border-green-200 rounded-md">
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-green-900">Calculation Results</h4>
            <div className="text-sm space-y-1 text-green-800">
              <p><strong>From:</strong> {result.from}</p>
              <p><strong>To:</strong> {result.to}</p>
              <p><strong>Distance:</strong> {result.distance.miles} miles {isRoundTrip && <span>(round trip)</span>}</p>
              {result.duration && (
                <p><strong>Duration:</strong> {result.duration.text}</p>
              )}
              <p className="text-lg font-bold text-green-900">
                <strong>Estimated deduction:</strong> ${result.estimatedDeduction}
              </p>
              <p className="text-xs text-green-600">
                Based on IRS rate of ${result.irsRate}/mile for 2024
              </p>
            </div>
          </div>
          
          <Button
            onClick={saveMileageLog}
            disabled={isSaving}
            variant="outline"
            size="sm"
            className="w-full bg-white"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Mileage Log
              </>
            )}
          </Button>
        </div>
      )}

      <p className="text-xs text-blue-600">
        * Based on 2024 IRS standard mileage rate of $0.21 per mile
      </p>
    </div>
  );
};

export default MileageCalculator;