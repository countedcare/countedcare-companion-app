import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with service role for auth verification
    const authHeader = req.headers.get('Authorization')
    console.log('Auth header received:', authHeader ? 'Present' : 'Missing')
    
    if (!authHeader) {
      console.error('No authorization header provided')
      return new Response(
        JSON.stringify({ error: 'Unauthorized', details: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Use service role to verify the JWT token
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verify the JWT token manually
    try {
      const jwt = authHeader.replace('Bearer ', '')
      const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(jwt)
      
      console.log('Auth verification result:', { 
        hasUser: !!user, 
        userId: user?.id, 
        error: authError?.message 
      })
      
      if (authError || !user) {
        console.error('Authentication failed:', authError)
        return new Response(
          JSON.stringify({ error: 'Unauthorized', details: authError?.message || 'Invalid token' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    } catch (error) {
      console.error('JWT verification error:', error)
      return new Response(
        JSON.stringify({ error: 'Unauthorized', details: 'Token verification failed' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get the Google Maps API key from environment
    const googleMapsApiKey = Deno.env.get('GOOGLE_MAPS_PLATFORM_API_KEY')
    
    if (!googleMapsApiKey) {
      return new Response(
        JSON.stringify({ error: 'Google Maps API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ apiKey: googleMapsApiKey }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in get-google-maps-key function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})