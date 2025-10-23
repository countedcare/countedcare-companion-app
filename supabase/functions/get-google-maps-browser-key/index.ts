import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

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
    // Get client IP for rate limiting
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || 
                     req.headers.get("x-real-ip") || 
                     "unknown";
    
    // Initialize Supabase client for rate limiting
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Check rate limit: 60 requests per minute per IP (reasonable for key fetching)
    const { data: rateLimitOk, error: rateLimitError } = await supabase
      .rpc("check_rate_limit", {
        p_endpoint: "get-google-maps-browser-key",
        p_identifier: clientIP,
        p_max_requests: 60,
        p_window_minutes: 1
      });
    
    if (rateLimitError) {
      console.error("Rate limit check error:", rateLimitError);
    } else if (!rateLimitOk) {
      console.warn("Rate limit exceeded for IP:", clientIP);
      return new Response(
        JSON.stringify({ 
          error: "Rate limit exceeded",
          message: "Too many requests. Please try again in a moment."
        }), 
        {
          status: 429,
          headers: { ...CORS, "Content-Type": "application/json" },
        }
      );
    }
    
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