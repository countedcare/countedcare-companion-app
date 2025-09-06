// supabase/functions/calculate-mileage/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

type DMRow = {
  elements: Array<{
    status: string;
    distance?: { text: string; value: number }; // meters
    duration?: { text: string; value: number }; // seconds
  }>;
};

type DMResponse = {
  status: string;
  origin_addresses: string[];
  destination_addresses: string[];
  rows: DMRow[];
  error_message?: string;
};

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const { from, to, fromPlaceId, toPlaceId } = await req.json().catch(() => ({} as any));

    if ((!from && !fromPlaceId) || (!to && !toPlaceId)) {
      return json({ error: "Missing 'from'/'to' address or 'fromPlaceId'/'toPlaceId'." }, 400);
    }

    // ✅ Your chosen env var
    const GOOGLE_MAPS_SERVER_KEY = Deno.env.get("GOOGLE_MAPS_SERVER_API_KEY");
    if (!GOOGLE_MAPS_SERVER_KEY) {
      return json({ error: "Server misconfiguration: GOOGLE_MAPS_SERVER_API_KEY not set." }, 500);
    }

    // IRS rate (default 0.21)
    const IRS_MILE_RATE = Number(Deno.env.get("IRS_MILE_RATE") ?? "0.21");

    // Prefer place_id when provided
    const origin = fromPlaceId ? `place_id:${fromPlaceId}` : String(from);
    const destination = toPlaceId ? `place_id:${toPlaceId}` : String(to);

    const params = new URLSearchParams({
      key: GOOGLE_MAPS_SERVER_KEY,
      origins: origin,
      destinations: destination,
      mode: "driving",
      units: "imperial",
    });

    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?${params.toString()}`;
    const resp = await fetch(url);
    if (!resp.ok) {
      const text = await resp.text();
      return json(
        {
          error: "Distance Matrix request failed (non-2xx). Check key, billing, and API restrictions.",
          details: text.slice(0, 500),
        },
        resp.status
      );
    }

    const data = (await resp.json()) as DMResponse;
    if (data.status !== "OK") {
      return json({ error: "Distance Matrix status not OK.", details: data.error_message || data.status }, 400);
    }

    const elem = data.rows?.[0]?.elements?.[0];
    if (!elem || elem.status !== "OK" || !elem.distance) {
      return json(
        {
          error: "No route found. Verify addresses/place IDs and that driving is possible.",
          details: elem?.status || "NO_ELEMENT",
        },
        400
      );
    }

    // meters -> miles (1 decimal)
    const miles = Math.round((elem.distance.value / 1609.344) * 10) / 10;
    const deduction = Math.round(miles * IRS_MILE_RATE * 100) / 100;

    return json({
      miles,
      deduction,
      origin: data.origin_addresses?.[0] ?? from ?? "",
      destination: data.destination_addresses?.[0] ?? to ?? "",
      durationText: elem.duration?.text,
      durationMinutes: elem.duration ? Math.round(elem.duration.value / 60) : undefined,
      rate: IRS_MILE_RATE,
    });
  } catch (e) {
    console.error("calculate-mileage error:", e);
    return json({ error: "Unhandled error in calculate-mileage.", details: String(e) }, 500);
  }
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}
