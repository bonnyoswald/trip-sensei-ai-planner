
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { destination, duration, budget, preferences } = await req.json()
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get user from auth token
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generate itinerary using OpenAI
    const prompt = `Generate a detailed ${duration}-day travel itinerary for ${destination} with a budget of $${budget}. 
    Preferences: ${JSON.stringify(preferences)}
    
    Return the response as a JSON object with this structure:
    {
      "title": "Trip title",
      "overview": "Brief description",
      "days": [
        {
          "day": 1,
          "date": "2024-01-01",
          "activities": [
            {
              "time": "09:00",
              "activity": "Activity name",
              "location": "Location name",
              "description": "Activity description",
              "estimated_cost": 50,
              "duration": "2 hours"
            }
          ]
        }
      ],
      "estimated_total_cost": 1500,
      "tips": ["Helpful tip 1", "Helpful tip 2"]
    }`

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert travel planner. Generate detailed, practical itineraries in JSON format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    })

    const aiResponse = await openAIResponse.json()
    const itinerary = JSON.parse(aiResponse.choices[0].message.content)

    // Save the generated itinerary as a trip
    const { data: trip, error } = await supabaseClient
      .from('trips')
      .insert({
        user_id: user.id,
        title: itinerary.title,
        description: itinerary.overview,
        destination,
        budget,
        itinerary: itinerary.days,
        status: 'draft'
      })
      .select()
      .single()

    if (error) throw error

    return new Response(
      JSON.stringify({ 
        itinerary,
        trip_id: trip.id
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
