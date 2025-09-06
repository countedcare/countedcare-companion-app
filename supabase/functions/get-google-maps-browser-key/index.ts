import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  try {
    console.log("Fetching Google Maps Browser API key from environment");
    
    const key = Deno.env.get("GOOGLE_MAPS_BROWSER_API_KEY");
    
    if (!key) {
      console.error("GOOGLE_MAPS_BROWSER_API_KEY not found in environment variables");
      return new Response(
        JSON.stringify({ 
          error: "Google Maps Browser API key not configured",
          message: "Please configure GOOGLE_MAPS_BROWSER_API_KEY in Supabase secrets"
        }), 
        {
          status: 500,
          headers: { ...CORS, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Successfully retrieved Google Maps Browser API key");
    
    return new Response(
      JSON.stringify({ 
        apiKey: key,
        success: true 
      }), 
      {
        headers: { ...CORS, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in get-google-maps-browser-key function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Internal server error",
        message: "Failed to retrieve API key"
      }), 
      {
        status: 500,
        headers: { ...CORS, "Content-Type": "application/json" },
      }
    );
  }
});