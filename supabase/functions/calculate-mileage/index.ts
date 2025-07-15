import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DistanceMatrixResponse {
  destination_addresses: string[]
  origin_addresses: string[]
  rows: Array<{
    elements: Array<{
      distance?: {
        text: string
        value: number
      }
      duration?: {
        text: string
        value: number
      }
      status: string
    }>
  }>
  status: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { from, to } = await req.json()

    if (!from || !to) {
      return new Response(
        JSON.stringify({ error: 'Missing from or to address' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get the API key from Supabase secrets
    const apiKey = Deno.env.get('GOOGLE_MAPS_API_KEY')
    console.log('API Key present:', !!apiKey)
    
    if (!apiKey) {
      console.error('Google Maps API key not found in environment variables')
      return new Response(
        JSON.stringify({ error: 'Google Maps API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Encode addresses for URL
    const encodedFrom = encodeURIComponent(from)
    const encodedTo = encodeURIComponent(to)

    // Call Google Maps Distance Matrix API
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodedFrom}&destinations=${encodedTo}&units=imperial&key=${apiKey}`
    console.log('Making request to Google Maps API')
    
    const response = await fetch(url)

    if (!response.ok) {
      console.error('Google Maps API HTTP error:', response.status, response.statusText)
      throw new Error(`Google Maps API responded with status: ${response.status}`)
    }

    const data: DistanceMatrixResponse = await response.json()
    console.log('Google Maps API response:', JSON.stringify(data, null, 2))

    if (data.status !== 'OK') {
      console.error('Google Maps API status error:', data.status)
      return new Response(
        JSON.stringify({ error: `Google Maps API error: ${data.status}` }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const element = data.rows[0]?.elements[0]
    
    if (!element || element.status !== 'OK') {
      return new Response(
        JSON.stringify({ error: 'Unable to calculate distance between addresses' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!element.distance) {
      return new Response(
        JSON.stringify({ error: 'Distance data not available' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Extract distance in miles (Google returns in meters, convert to miles)
    const distanceInMeters = element.distance.value
    const distanceInMiles = distanceInMeters * 0.000621371 // Convert meters to miles
    
    // Calculate IRS reimbursement at $0.67 per mile for 2024
    const irsRate = 0.67
    const estimatedDeduction = distanceInMiles * irsRate

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          from: data.origin_addresses[0],
          to: data.destination_addresses[0],
          distance: {
            miles: Math.round(distanceInMiles * 10) / 10, // Round to 1 decimal place
            text: element.distance.text
          },
          duration: element.duration ? {
            text: element.duration.text,
            minutes: Math.round(element.duration.value / 60)
          } : null,
          estimatedDeduction: Math.round(estimatedDeduction * 100) / 100, // Round to 2 decimal places
          irsRate
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in calculate-mileage function:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})