import React from "react";
import MileageForm from "@/features/mileage/MileageForm";

export default function MileagePage() {
  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-xl font-semibold mb-4">Mileage Tracker</h1>
      <MileageForm />
    </div>
  );
}