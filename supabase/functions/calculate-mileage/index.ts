import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

interface MileageRequest {
  from: string;
  to: string;
  fromPlaceId?: string;
  toPlaceId?: string;
}

interface MileageResponse {
  miles: number;
  origin: string;
  destination: string;
  durationText?: string;
  durationMinutes?: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS });
  }

  try {
    const { from, to, fromPlaceId, toPlaceId }: MileageRequest = await req.json();

    if (!from || !to) {
      return new Response(
        JSON.stringify({ error: 'Both from and to addresses are required' }),
        { 
          status: 400,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        }
      );
    }

    // Get Google Maps API key from environment
    const apiKey = Deno.env.get('GOOGLE_MAPS_SERVER_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'Google Maps API key not configured' }),
        { 
          status: 500,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        }
      );
    }

    // Use place IDs if available, otherwise use addresses
    const origins = fromPlaceId ? `place_id:${fromPlaceId}` : encodeURIComponent(from);
    const destinations = toPlaceId ? `place_id:${toPlaceId}` : encodeURIComponent(to);

    // Call Google Maps Distance Matrix API
    const distanceMatrixUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origins}&destinations=${destinations}&units=imperial&key=${apiKey}`;
    
    console.log('Calling Distance Matrix API:', distanceMatrixUrl.replace(apiKey, 'REDACTED'));

    const response = await fetch(distanceMatrixUrl);
    const data = await response.json();

    console.log('Distance Matrix API response:', JSON.stringify(data, null, 2));

    if (data.status !== 'OK') {
      throw new Error(`Distance Matrix API error: ${data.status} - ${data.error_message || 'Unknown error'}`);
    }

    if (!data.rows || data.rows.length === 0 || !data.rows[0].elements || data.rows[0].elements.length === 0) {
      throw new Error('No route found between the specified locations');
    }

    const element = data.rows[0].elements[0];
    
    if (element.status !== 'OK') {
      throw new Error(`Route calculation failed: ${element.status}`);
    }

    if (!element.distance || !element.duration) {
      throw new Error('Distance or duration information not available');
    }

    // Convert meters to miles
    const miles = Math.round((element.distance.value * 0.000621371) * 10) / 10;
    const durationMinutes = Math.round(element.duration.value / 60);

    const result: MileageResponse = {
      miles,
      origin: data.origin_addresses[0] || from,
      destination: data.destination_addresses[0] || to,
      durationText: element.duration.text,
      durationMinutes
    };

    console.log('Calculated mileage result:', result);

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error calculating mileage:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to calculate mileage';
    const errorDetails = error instanceof Error ? error.toString() : String(error);
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: errorDetails
      }),
      { 
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      }
    );
  }
});