import React, { useState } from 'react';
import { MapPin, Calculator, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import MileageLocationInput from '@/components/MileageLocationInput';
import { SelectedPlace } from '@/hooks/usePlacesAutocomplete';
import useGoogleMapsAPI from '@/hooks/useGoogleMapsAPI';

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
  const { apiKey, isConfigured, isLoading, error: mapsError } = useGoogleMapsAPI();
  
  // Check if there's a persistent Google Maps API error
  const hasMapsApiError = !!(mapsError && mapsError.includes('RefererNotAllowedMapError'));

  const [fromAddress, setFromAddress] = useState('');
  const [toAddress, setToAddress] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [result, setResult] = useState<MileageResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRoundTrip, setIsRoundTrip] = useState(false);
  const [mapsApiError, setMapsApiError] = useState<boolean>(false);

  const [fromIsGPS, setFromIsGPS] = useState(false);
  const [toIsGPS, setToIsGPS] = useState(false);
  const [fromPlaceId, setFromPlaceId] = useState<string | null>(null);
  const [toPlaceId, setToPlaceId] = useState<string | null>(null);

  const buildMapsPreviewLink = (value: string) => {
    const query = encodeURIComponent(value);
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  };

  const useCurrentLocation = (target: 'from' | 'to') => {
    if (!navigator.geolocation) {
      toast({
        title: 'Location unavailable',
        description: 'Geolocation is not supported by your browser.',
        variant: 'destructive'
      });
      return;
    }
    toast({ title: 'Requesting location', description: 'Please allow location access in your browser.' });
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const coords = `${latitude},${longitude}`;

        // Try to reverse geocode if Google Maps API is available
        if (isConfigured && apiKey && window.google?.maps && !mapsApiError) {
          try {
            const geocoder = new window.google.maps.Geocoder();
            const result = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
              const timeout = setTimeout(() => {
                reject(new Error('Geocoding timeout'));
              }, 5000);
              
              geocoder.geocode(
                { location: { lat: latitude, lng: longitude } },
                (results, status) => {
                  clearTimeout(timeout);
                  if (status === 'OK' && results) {
                    resolve(results);
                  } else {
                    reject(new Error(`Geocoding failed: ${status}`));
                  }
                }
              );
            });

            if (result && result[0]) {
              const address = result[0].formatted_address;
              if (target === 'from') {
                setFromAddress(address);
                setFromIsGPS(false);
                setFromPlaceId(result[0].place_id || null);
              } else {
                setToAddress(address);
                setToIsGPS(false);
                setToPlaceId(result[0].place_id || null);
              }
              toast({
                title: 'Location set',
                description: `${target === 'from' ? 'From' : 'To'} address set to: ${address}`
              });
            } else {
              throw new Error('No address found');
            }
          } catch (error) {
            console.warn('Reverse geocoding failed, using coordinates:', error);
            // Check if this is a Google Maps API error
            if (error instanceof Error && error.message.includes('RefererNotAllowedMapError')) {
              setMapsApiError(true);
            }
            // Fallback to coordinates
            if (target === 'from') {
              setFromAddress(coords);
              setFromIsGPS(true);
              setFromPlaceId(null);
            } else {
              setToAddress(coords);
              setToIsGPS(true);
              setToPlaceId(null);
            }
            toast({
              title: 'Location set',
              description: `${target === 'from' ? 'From' : 'To'} address set to current location (coordinates)`
            });
          }
        } else {
          // Fallback to coordinates when Google Maps isn't available
          if (target === 'from') {
            setFromAddress(coords);
            setFromIsGPS(true);
            setFromPlaceId(null);
          } else {
            setToAddress(coords);
            setToIsGPS(true);
            setToPlaceId(null);
          }
          toast({
            title: 'Location set',
            description: `${target === 'from' ? 'From' : 'To'} address set to current location.`
          });
        }

        setResult(null);
      },
      (err) => {
        console.error('Geolocation error', err);
        toast({
          title: 'Location denied',
          description: 'We could not access your location. You can type the address manually.',
          variant: 'destructive'
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const calculateMileage = async () => {
    console.log('Calculate button clicked', { fromAddress, toAddress });
    
    if (!fromAddress.trim() || !toAddress.trim()) {
      toast({
        title: 'Missing Information',
        description: "Please enter both 'From' and 'To' addresses.",
        variant: 'destructive'
      });
      return;
    }

    setIsCalculating(true);
    setError(null);
    setResult(null);

    try {
      console.log('Calling calculate-mileage edge function...');
      const { data, error } = await supabase.functions.invoke('calculate-mileage', {
        body: {
          from: fromAddress.trim(),
          to: toAddress.trim(),
          fromPlaceId: fromPlaceId ?? undefined,
          toPlaceId: toPlaceId ?? undefined,
        }
      });

      console.log('Edge function response:', { data, error });

      if (error) throw new Error(error.message || 'Failed to calculate mileage');

      // Edge function returns { miles, deduction, origin, destination }
      const baseMiles = typeof data?.miles === 'number' ? Math.round(data.miles * 10) / 10 : 0;
      const appliedMiles = isRoundTrip ? Math.round(baseMiles * 2 * 10) / 10 : baseMiles;
      const computedDeduction = Math.round(appliedMiles * 0.21 * 100) / 100;

      const resolvedFrom = (typeof data?.origin === 'string' && data.origin) ? data.origin : fromAddress.trim();
      const resolvedTo = (typeof data?.destination === 'string' && data.destination) ? data.destination : toAddress.trim();

      const resultPayload: MileageResult = {
        from: resolvedFrom,
        to: resolvedTo,
        distance: { miles: appliedMiles, text: `${appliedMiles} miles` },
        estimatedDeduction: computedDeduction,
        irsRate: 0.21
      };

      setResult(resultPayload);
      onAmountCalculated(computedDeduction);

      toast({
        title: 'Mileage Calculated!',
        description: `Distance: ${appliedMiles} miles • Total: $${computedDeduction}${isRoundTrip ? ' (round trip)' : ''}`
      });

    } catch (err) {
      console.error('Calculate mileage error:', err);
      let errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      
      // Handle specific Google Maps API errors
      if (typeof errorMessage === 'string') {
        if (errorMessage.includes('non-2xx') || errorMessage.includes('RefererNotAllowedMapError')) {
          setMapsApiError(true);
          errorMessage = `Google Maps API access restricted for this domain. The calculation service is unavailable, but you can still manually enter addresses and we'll attempt to calculate the distance. Please configure your Google Maps API key to allow requests from: ${window.location.origin}`;
        } else if (errorMessage.includes('Distance Matrix API') || errorMessage.includes('API restriction')) {
          errorMessage = 'Please enable the "Distance Matrix API" in Google Cloud Console and ensure your API key has the proper permissions.';
        }
      }
      
      setError(errorMessage);

      toast({
        title: 'Calculation Failed',
        description: errorMessage,
        variant: 'destructive'
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
        title: 'Mileage Log Saved!',
        description: 'Your mileage expense has been added to your records.'
      });

    } catch (err) {
      console.error('Error saving mileage log:', err);
      toast({
        title: 'Save Failed',
        description: 'Could not save mileage log. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Debug log to check button state
  const isButtonDisabled = isCalculating || !fromAddress.trim() || !toAddress.trim();
  console.log('Button state:', { isButtonDisabled, fromAddress, toAddress, isCalculating });

  return (
    <div className="space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-blue-600" />
        <h4 className="font-medium text-blue-900">Track Mileage</h4>
      </div>

      {(!isConfigured || mapsApiError || mapsError) && (
        <Alert variant="destructive">
          <AlertDescription>
            <div className="space-y-2">
              <p><strong>Google Maps API Configuration Issue</strong></p>
              {mapsApiError && (
                <p>Domain not authorized. Add this domain to your Google Maps API restrictions:</p>
              )}
              {mapsError && (
                <p>Maps API Error: {mapsError}</p>
              )}
              {!isConfigured && !mapsError && (
                <p>Add this domain to your Google Maps API restrictions:</p>
              )}
              <code className="bg-gray-800 text-white px-2 py-1 rounded text-xs block mt-1">
                {window.location.origin}/*
              </code>
              <p className="text-xs mt-2">
                Go to Google Cloud Console → APIs & Services → Credentials → Edit your API key → Application restrictions → HTTP referrers
              </p>
              <p className="text-xs mt-1 text-yellow-600">
                <strong>Note:</strong> You can still calculate mileage by entering addresses manually. The calculation will work even without Google Maps autocomplete.
              </p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <p className="text-xs text-muted-foreground">
        Tip: Allow location access to quickly set your current location for From/To.
      </p>

      <div className="grid grid-cols-1 gap-4">
        {/* From Address */}
        <div className="space-y-2">
          {(isConfigured && !mapsApiError && !hasMapsApiError) ? (
            <MileageLocationInput
              label="From Address"
              placeholder="Enter starting address"
              onSelected={(place: SelectedPlace) => {
                setFromAddress(place.formattedAddress);
                setFromIsGPS(false);
                setFromPlaceId(place.placeId);
                setResult(null);
              }}
            />
          ) : (
            <>
              <Label htmlFor="from-address" className="text-sm font-medium">From Address</Label>
              <Input
                id="from-address"
                placeholder="Enter starting address or coordinates (e.g., '123 Main St' or '34.0522,-118.2437')"
                value={fromAddress}
                onChange={(e) => { 
                  console.log('From address changed:', e.target.value);
                  setFromAddress(e.target.value); 
                  setFromPlaceId(null); 
                  setResult(null); 
                }}
                className="bg-white"
              />
            </>
          )}
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => useCurrentLocation('from')}>
              Use Current Location
            </Button>
            {fromAddress && (
              <a
                href={buildMapsPreviewLink(fromAddress)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm underline text-blue-700"
              >
                Preview on Google Maps
              </a>
            )}
          </div>
        </div>

        {/* To Address */}
        <div className="space-y-2">
          {(isConfigured && !mapsApiError && !hasMapsApiError) ? (
            <MileageLocationInput
              label="To Address"
              placeholder="Enter destination address"
              onSelected={(place: SelectedPlace) => {
                setToAddress(place.formattedAddress);
                setToIsGPS(false);
                setToPlaceId(place.placeId);
                setResult(null);
              }}
            />
          ) : (
            <>
              <Label htmlFor="to-address" className="text-sm font-medium">To Address</Label>
              <Input
                id="to-address"
                placeholder="Enter destination address or coordinates (e.g., '456 Oak Ave' or '34.0522,-118.2437')"
                value={toAddress}
                onChange={(e) => { 
                  console.log('To address changed:', e.target.value);
                  setToAddress(e.target.value); 
                  setToPlaceId(null); 
                  setResult(null); 
                }}
                className="bg-white"
              />
            </>
          )}
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => useCurrentLocation('to')}>
              Use Current Location
            </Button>
            {toAddress && (
              <a
                href={buildMapsPreviewLink(toAddress)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm underline text-blue-700"
              >
                Preview on Google Maps
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Switch id="round-trip" checked={isRoundTrip} onCheckedChange={setIsRoundTrip} />
        <Label htmlFor="round-trip" className="text-sm font-medium">Round trip</Label>
      </div>

      <Button
        onClick={calculateMileage}
        disabled={isButtonDisabled}
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
    </div>
  );
};

export default MileageCalculator;
