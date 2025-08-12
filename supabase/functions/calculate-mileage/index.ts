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
    const body = await req.json()
    const from = body?.from
    const to = body?.to
    const fromPlaceId = body?.fromPlaceId
    const toPlaceId = body?.toPlaceId

    if (!from || !to) {
      console.error('Missing required parameters:', { from: !!from, to: !!to })
      return new Response('Missing from or to address', { 
        status: 400,
        headers: corsHeaders
      })
    }

    const apiKey = Deno.env.get('GOOGLE_MAPS_API_KEY')
    if (!apiKey) {
      console.error('Google Maps API key not found in environment variables')
      return new Response('Google Maps API key not configured', { 
        status: 500,
        headers: corsHeaders
      })
    }

    const originParam = encodeURIComponent(fromPlaceId ? `place_id:${fromPlaceId}` : from)
    const destinationParam = encodeURIComponent(toPlaceId ? `place_id:${toPlaceId}` : to)
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${originParam}&destinations=${destinationParam}&units=imperial&mode=driving&key=${apiKey}`
    console.log('Making request to Google Maps API for:', { from, to, fromPlaceId, toPlaceId, url })

    const res = await fetch(url)
    const data: DistanceMatrixResponse = await res.json()

    if (res.status !== 200) {
      console.error('Google Maps API error:', data)
      return new Response('Google Maps API failed', { 
        status: 502,
        headers: corsHeaders
      })
    }

    if (data.status !== 'OK') {
      console.error('Google Maps API status error:', data.status, data.error_message)
      return new Response(`Google Maps API error: ${data.status}`, { 
        status: 400,
        headers: corsHeaders
      })
    }

    const element = data.rows[0]?.elements[0]
    if (!element || element.status !== 'OK' || !element.distance) {
      console.error('Invalid distance data:', element)
      return new Response('Unable to calculate distance', { 
        status: 400,
        headers: corsHeaders
      })
    }

    const distanceMeters = element.distance.value
    const miles = distanceMeters / 1609.34
    const deduction = miles * 0.21

    console.log('Calculation successful:', { miles: miles.toFixed(2), deduction: deduction.toFixed(2) })

    return new Response(JSON.stringify({ 
      miles: Math.round(miles * 10) / 10, 
      deduction: Math.round(deduction * 100) / 100,
      origin: data.origin_addresses?.[0] ?? null,
      destination: data.destination_addresses?.[0] ?? null
    }), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      }
    })

  } catch (err) {
    console.error('Server error:', err)
    return new Response('Internal Server Error', { 
      status: 500,
      headers: corsHeaders
    })
  }
})