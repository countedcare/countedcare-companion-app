import React, { useEffect, useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import useGoogleMapsAPI from "@/hooks/useGoogleMapsAPI";

export type SelectedPlace = {
  placeId: string;
  formattedAddress: string;
};

type Props = {
  label: string;
  placeholder?: string;
  onSelected: (place: SelectedPlace) => void;
  onInputChange?: (text: string) => void; // bubble free-text to parent
  className?: string;
};

export default function MileageLocationInput({
  label,
  placeholder,
  onSelected,
  onInputChange,
  className,
}: Props) {
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const [preds, setPreds] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const serviceRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const tokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);

  const { isConfigured, isLoading } = useGoogleMapsAPI();
  const canUsePlaces = isConfigured && !!(window.google?.maps?.places);

  useEffect(() => {
    if (canUsePlaces && !serviceRef.current) {
      serviceRef.current = new google.maps.places.AutocompleteService();
      tokenRef.current = new google.maps.places.AutocompleteSessionToken();
    }
  }, [canUsePlaces]);

  // Debounced fetch
  useEffect(() => {
    if (!canUsePlaces || !serviceRef.current) return;
    const input = value.trim();
    if (!input) {
      setPreds([]);
      return;
    }
    const id = setTimeout(() => {
      serviceRef.current!.getPlacePredictions(
        {
          input,
          sessionToken: tokenRef.current!,
          componentRestrictions: undefined, // optionally restrict (country: 'us')
        },
        (res, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && res) {
            setPreds(res);
            setOpen(true);
          } else {
            setPreds([]);
            setOpen(false);
          }
        }
      );
    }, 180);
    return () => clearTimeout(id);
  }, [value, canUsePlaces]);

  function select(p: google.maps.places.AutocompletePrediction) {
    // We can use description as a human-friendly address; if you need
    // canonical formatting, call Places Details (not required for mileage).
    onSelected({ placeId: p.place_id, formattedAddress: p.description });
    setValue(p.description);
    setOpen(false);
    // New session for next address entry
    tokenRef.current = new google.maps.places.AutocompleteSessionToken();
  }

  if (isLoading) {
    return (
      <div className={cn("relative", className)}>
        <Label className="text-sm font-medium">{label}</Label>
        <Input
          placeholder="Loading Google Maps..."
          disabled
          className="bg-white"
        />
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <Label className="text-sm font-medium">{label}</Label>
      <Input
        placeholder={placeholder}
        value={value}
        disabled={!canUsePlaces}
        onChange={(e) => {
          const t = e.target.value;
          setValue(t);
          onInputChange?.(t);
          if (!t) setOpen(false);
        }}
        onFocus={() => { if (preds.length) setOpen(true); }}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="bg-white"
      />
      {open && preds.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-white shadow-lg max-h-60 overflow-auto">
          {preds.map((p) => (
            <button
              key={p.place_id}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => select(p)}
              className="w-full text-left px-3 py-2 hover:bg-gray-50"
            >
              {p.description}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
