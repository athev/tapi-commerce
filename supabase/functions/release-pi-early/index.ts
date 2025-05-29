
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
    console.log('=== RELEASE PI EARLY FUNCTION START ===')
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { orderId } = await req.json()
    
    if (!orderId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Order ID is required'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log(`📦 Processing early PI release for order: ${orderId}`)

    // Find pending wallet logs for this order
    const { data: pendingLogs, error: fetchError } = await supabase
      .from('wallet_logs')
      .select(`
        id,
        wallet_id,
        pi_amount,
        wallets!inner(user_id, pending, available)
      `)
      .eq('order_id', orderId)
      .eq('status', 'pending')

    if (fetchError) {
      console.error('❌ Error fetching pending logs:', fetchError)
      throw fetchError
    }

    if (!pendingLogs || pendingLogs.length === 0) {
      console.log('⚠️ No pending PI found for this order')
      return new Response(JSON.stringify({
        success: true,
        message: 'No pending PI to release'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    let releasedTotal = 0

    for (const log of pendingLogs) {
      try {
        console.log(`🔄 Releasing ${log.pi_amount} PI from log ${log.id}`)
        
        // Update wallet: move from pending to available
        const { error: walletError } = await supabase
          .from('wallets')
          .update({
            pending: Math.max(0, log.wallets.pending - log.pi_amount),
            available: log.wallets.available + log.pi_amount
          })
          .eq('id', log.wallet_id)

        if (walletError) {
          console.error(`❌ Error updating wallet ${log.wallet_id}:`, walletError)
          continue
        }

        // Update wallet log status
        const { error: logError } = await supabase
          .from('wallet_logs')
          .update({ 
            status: 'released',
            updated_at: new Date().toISOString()
          })
          .eq('id', log.id)

        if (logError) {
          console.error(`❌ Error updating log ${log.id}:`, logError)
          continue
        }

        releasedTotal += log.pi_amount
        console.log(`✅ Released ${log.pi_amount} PI early`)

      } catch (error) {
        console.error(`❌ Error processing log ${log.id}:`, error)
      }
    }

    const result = {
      success: true,
      message: 'PI released early successfully',
      order_id: orderId,
      total_released: releasedTotal,
      logs_processed: pendingLogs.length
    }

    console.log('🎉 Early PI release completed:', result)

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('❌ Early PI release error:', error)
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to release PI early',
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
