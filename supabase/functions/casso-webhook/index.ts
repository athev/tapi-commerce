
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { processTransaction } from './transactionProcessor.ts'
import { processSellerEarning } from './walletService.ts'
import { createOrderSupportChat } from './chatService.ts'

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
    console.log('=== CASSO WEBHOOK V3 REQUEST START ===')
    console.log('Request method:', req.method)
    console.log('Request URL:', req.url)

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Parse request body
    let payload: any
    try {
      const rawBody = await req.text()
      console.log('Raw body received:', rawBody)
      payload = JSON.parse(rawBody)
    } catch (error) {
      console.error('Failed to parse JSON:', error)
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid JSON payload'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('Parsed payload:', JSON.stringify(payload, null, 2))

    // Handle webhook test
    if (payload.error === 0 && payload.data && payload.data.id === 0) {
      console.log('🧪 Test webhook detected')
      return new Response(JSON.stringify({
        success: true,
        message: 'Test webhook received successfully'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Process real transaction
    if (payload.error === 0 && payload.data) {
      const transaction = payload.data
      console.log('Processing transaction:', transaction)

      // Process the transaction (existing logic)
      const result = await processTransaction(transaction, supabase)
      
      // If transaction was successfully processed and matched to an order
      if (result.status === 'success' && result.order) {
        console.log('🎉 Transaction processed successfully, now processing wallet and chat...')
        
        // Process seller earning (add PI to wallet)
        await processSellerEarning(result.order, result.transaction_amount || transaction.amount, supabase)
        
        // Create order support chat
        const conversationId = await createOrderSupportChat(result.order, supabase)
        
        return new Response(JSON.stringify({
          success: true,
          message: 'Payment processed successfully',
          order_id: result.order.id,
          transaction_id: result.transaction_id,
          conversation_id: conversationId
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Return the original result if not successful
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Invalid payload
    return new Response(JSON.stringify({
      success: false,
      error: 'Invalid payload structure'
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
