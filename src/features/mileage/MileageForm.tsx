import React, { useState } from "react";
import MileageLocationInput from "@/components/MileageLocationInput";
import { SelectedPlace } from "@/hooks/usePlacesAutocomplete";

export default function MileageForm() {
  const [origin, setOrigin] = useState<SelectedPlace | null>(null);
  const [destination, setDestination] = useState<SelectedPlace | null>(null);

  return (
    <div className="space-y-4">
      <MileageLocationInput
        label="Origin"
        placeholder="Enter starting address"
        onSelected={(p) => setOrigin(p)}
        country="us"
      />

      <MileageLocationInput
        label="Destination"
        placeholder="Enter destination address"
        onSelected={(p) => setDestination(p)}
        country="us"
      />

      <div className="rounded-xl border p-3 text-sm">
        <div>
          <span className="font-medium">Origin:</span>{" "}
          {origin?.formattedAddress || "—"}
        </div>
        <div>
          <span className="font-medium">Destination:</span>{" "}
          {destination?.formattedAddress || "—"}
        </div>

        {origin && destination && (
          <div className="mt-3 text-gray-600">
            Coordinates ready for distance calc:
            <div>From: {origin.location.lat.toFixed(5)}, {origin.location.lng.toFixed(5)}</div>
            <div>To: {destination.location.lat.toFixed(5)}, {destination.location.lng.toFixed(5)}</div>
          </div>
        )}
      </div>
    </div>
  );
}