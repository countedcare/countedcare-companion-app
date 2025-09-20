import React from "react";
import usePlacesAutocomplete, { SelectedPlace } from "@/hooks/usePlacesAutocomplete";

type Props = {
  label: string;
  placeholder?: string;
  onSelected: (place: SelectedPlace) => void;
  country?: string | string[];
  value?: string;
};

const baseItem = "px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm";
const activeItem = "bg-gray-100";

export default function MileageLocationInput({
  label,
  placeholder = "Search address or place",
  onSelected,
  country = "us",
  value,
}: Props) {
  const {
    isConfigured,
    isLoading,
    error,
    input,
    setInput,
    predictions,
    highlightIndex,
    setHighlight,
    selectPrediction,
  } = usePlacesAutocomplete({
    debounceMs: 200,
    minLength: 2,
    componentRestrictions: { country },
    types: ["geocode"],
  });

  const textVal = value ?? input;

  return (
    <div className="w-full">
      <label className="block text-sm font-medium mb-1">{label}</label>
      <div className="relative">
        <input
          type="text"
          value={textVal}
          disabled={!isConfigured}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isConfigured ? placeholder : "Loading maps…"}
          className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          aria-autocomplete="list"
          aria-expanded={predictions.length > 0}
        />

        {isConfigured && predictions.length > 0 && (
          <ul className="absolute z-50 mt-1 w-full rounded-xl border bg-white shadow-md max-h-72 overflow-auto">
            {predictions.map((p, i) => (
              <li
                id={`opt-${i}`}
                key={p.place_id}
                className={`${baseItem} ${i === highlightIndex ? activeItem : ""}`}
                onMouseEnter={() => setHighlight(i)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  selectPrediction(p).then(onSelected).catch(console.error);
                }}
              >
                <div className="font-medium">
                  {p.structured_formatting?.main_text || p.description}
                </div>
                <div className="text-gray-500 text-xs truncate">
                  {p.structured_formatting?.secondary_text}
                </div>
              </li>
            ))}
          </ul>
        )}

        {isLoading && (
          <div className="absolute right-2 top-2 text-xs text-gray-400">…</div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}