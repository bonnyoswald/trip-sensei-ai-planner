
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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get pending tasks that are due
    const { data: tasks, error } = await supabaseClient
      .from('scheduled_tasks')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_for', new Date().toISOString())
      .lt('attempts', 'max_attempts')

    if (error) throw error

    const results = []

    for (const task of tasks || []) {
      try {
        // Update attempts
        await supabaseClient
          .from('scheduled_tasks')
          .update({ 
            attempts: task.attempts + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', task.id)

        // Process different task types
        switch (task.task_type) {
          case 'price_alert_check':
            await processPriceAlert(task, supabaseClient)
            break
          case 'send_reminder_email':
            await sendReminderEmail(task, supabaseClient)
            break
          case 'generate_daily_recommendations':
            await generateDailyRecommendations(task, supabaseClient)
            break
          default:
            throw new Error(`Unknown task type: ${task.task_type}`)
        }

        // Mark as completed
        await supabaseClient
          .from('scheduled_tasks')
          .update({ 
            status: 'completed',
            updated_at: new Date().toISOString()
          })
          .eq('id', task.id)

        results.push({ task_id: task.id, status: 'completed' })

      } catch (error) {
        // Check if max attempts reached
        if (task.attempts + 1 >= task.max_attempts) {
          await supabaseClient
            .from('scheduled_tasks')
            .update({ 
              status: 'failed',
              updated_at: new Date().toISOString()
            })
            .eq('id', task.id)
        }

        results.push({ task_id: task.id, status: 'failed', error: error.message })
      }
    }

    return new Response(
      JSON.stringify({ 
        processed: results.length,
        results 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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

async function processPriceAlert(task: any, supabase: any) {
  // Implementation for checking price alerts
  console.log('Processing price alert:', task.payload)
}

async function sendReminderEmail(task: any, supabase: any) {
  // Implementation for sending reminder emails
  console.log('Sending reminder email:', task.payload)
}

async function generateDailyRecommendations(task: any, supabase: any) {
  // Implementation for generating daily recommendations
  console.log('Generating daily recommendations:', task.payload)
}
