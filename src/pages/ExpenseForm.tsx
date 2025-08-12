import React, { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeftRight, MapPin, Loader2 } from 'lucide-react';

declare global {
  interface Window {
    google?: typeof google;
  }
}

type Props = {
  apiKey: string;
  defaultRatePerMile?: number;           // default 0.21
  onAmountCalculated: (amount: number, miles: number) => void;
  initialFrom?: string;
  initialTo?: string;
  roundTripDefault?: boolean;
};

const loadGoogleMaps = (apiKey: string) =>
  new Promise<void>((resolve, reject) => {
    if (window.google?.maps) return resolve();
    const existing = document.querySelector<HTMLScriptElement>('script[data-gmaps="true"]');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Google Maps failed to load')));
      return;
    }
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.dataset.gmaps = 'true';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Google Maps failed to load'));
    document.head.appendChild(script);
  });

const toMiles = (meters: number) => meters / 1609.344;

const MileageCalculator: React.FC<Props> = ({
  apiKey,
  defaultRatePerMile = 0.21,
  onAmountCalculated,
  initialFrom = '',
  initialTo = '',
  roundTripDefault = true,
}) => {
  const { toast } = useToast();
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);
  const [rate, setRate] = useState(defaultRatePerMile.toFixed(2));
  const [roundTrip, setRoundTrip] = useState(roundTripDefault);
  const [miles, setMiles] = useState<number | null>(null);
  const [amount, setAmount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const fromRef = useRef<HTMLInputElement | null>(null);
  const toRef = useRef<HTMLInputElement | null>(null);
  const fromAuto = useRef<google.maps.places.Autocomplete | null>(null);
  const toAuto = useRef<google.maps.places.Autocomplete | null>(null);

  // Initialize Google Places Autocomplete
  useEffect(() => {
    let mounted = true;
    loadGoogleMaps(apiKey)
      .then(() => {
        if (!mounted) return;
        if (fromRef.current && !fromAuto.current) {
          fromAuto.current = new window.google!.maps.places.Autocomplete(fromRef.current!, {
            fields: ['formatted_address', 'geometry', 'name'],
          });
          fromAuto.current.addListener('place_changed', () => {
            const place = fromAuto.current!.getPlace();
            setFrom(place.formatted_address || place.name || fromRef.current!.value);
          });
        }
        if (toRef.current && !toAuto.current) {
          toAuto.current = new window.google!.maps.places.Autocomplete(toRef.current!, {
            fields: ['formatted_address', 'geometry', 'name'],
          });
          toAuto.current.addListener('place_changed', () => {
            const place = toAuto.current!.getPlace();
            setTo(place.formatted_address || place.name || toRef.current!.value);
          });
        }
      })
      .catch((e) => {
        console.error(e);
        toast({
          title: 'Google Maps not available',
          description: 'Enter addresses manually; distance lookup may fail.',
          variant: 'destructive',
        });
      });
    return () => {
      mounted = false;
    };
  }, [apiKey, toast]);

  const swap = () => {
    setFrom((prev) => {
      const tmp = to;
      setTo(prev);
      return tmp;
    });
    setMiles(null);
    setAmount(null);
  };

  const compute = async () => {
    setLoading(true);
    setMiles(null);
    setAmount(null);
    try {
      if (!window.google?.maps) throw new Error('Google Maps not loaded');
      if (!from || !to) throw new Error('Please enter both locations');

      const svc = new window.google.maps.DistanceMatrixService();
      const res = await svc.getDistanceMatrix({
        origins: [from],
        destinations: [to],
        travelMode: window.google.maps.TravelMode.DRIVING,
        unitSystem: window.google.maps.UnitSystem.IMPERIAL,
      });

      const el = res.rows?.[0]?.elements?.[0];
      if (!el || el.status !== 'OK') throw new Error('Could not calculate distance');

      let totalMiles = toMiles(el.distance.value);
      if (roundTrip) totalMiles *= 2;

      // keep two decimals on miles
      totalMiles = Math.round(totalMiles * 100) / 100;

      const numericRate = Number(rate);
      const totalAmount = Math.round(totalMiles * numericRate * 100) / 100;

      setMiles(totalMiles);
      setAmount(totalAmount);
    } catch (e: any) {
      console.error(e);
      toast({
        title: 'Distance error',
        description: e?.message || 'Failed to compute mileage',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const apply = () => {
    if (amount == null || miles == null) return;
    onAmountCalculated(amount, miles);
    toast({
      title: 'Mileage applied',
      description: `Added $${amount.toFixed(2)} for ${miles.toFixed(2)} mi${roundTrip ? ' (roundtrip)' : ''}.`,
    });
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="grid md:grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="m-from" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" /> From
          </Label>
          <Input
            id="m-from"
            ref={fromRef}
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            placeholder="Start address or place"
            autoComplete="off"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="m-to" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" /> To
          </Label>
          <Input
            id="m-to"
            ref={toRef}
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="Destination address or place"
            autoComplete="off"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={swap} title="Swap">
          <ArrowLeftRight className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-2 ml-auto">
          <Checkbox id="roundtrip" checked={roundTrip} onCheckedChange={(v) => setRoundTrip(!!v)} />
          <Label htmlFor="roundtrip">Roundtrip</Label>
        </div>

        <div className="flex items-center gap-2">
          <Label htmlFor="rate">Rate $/mi</Label>
          <Input
            id="rate"
            type="number"
            step="0.01"
            className="w-24"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
          />
        </div>

        <Button type="button" onClick={compute} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Calculate'}
        </Button>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        <div className="p-3 rounded bg-muted">
          <div className="text-xs text-muted-foreground">Miles</div>
          <div className="text-lg font-medium">{miles != null ? miles.toFixed(2) : '—'}</div>
        </div>
        <div className="p-3 rounded bg-muted">
          <div className="text-xs text-muted-foreground">Rate</div>
          <div className="text-lg font-medium">${Number(rate || 0).toFixed(2)}/mi</div>
        </div>
        <div className="p-3 rounded bg-muted">
          <div className="text-xs text-muted-foreground">Amount</div>
          <div className="text-lg font-medium">{amount != null ? `$${amount.toFixed(2)}` : '—'}</div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="button" variant="secondary" disabled={amount == null} onClick={apply}>
          Apply to Expense
        </Button>
      </div>
    </Card>
  );
};

export default MileageCalculator;

