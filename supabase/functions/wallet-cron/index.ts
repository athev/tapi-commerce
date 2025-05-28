
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
    console.log('=== WALLET CRON JOB START ===')
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Tìm các wallet logs cần release (release_date <= now() và status = pending)
    const { data: pendingLogs, error: fetchError } = await supabase
      .from('wallet_logs')
      .select(`
        id,
        wallet_id,
        pi_amount,
        release_date,
        wallets!inner(user_id, pending, available)
      `)
      .eq('status', 'pending')
      .lte('release_date', new Date().toISOString())

    if (fetchError) {
      console.error('❌ Error fetching pending logs:', fetchError)
      throw fetchError
    }

    console.log(`📊 Found ${pendingLogs?.length || 0} logs to process`)

    let processedCount = 0
    let errorCount = 0

    if (pendingLogs && pendingLogs.length > 0) {
      for (const log of pendingLogs) {
        try {
          console.log(`🔄 Processing log ${log.id} - ${log.pi_amount} PI`)
          
          // Cập nhật wallet: trừ pending, cộng available
          const { error: walletError } = await supabase
            .from('wallets')
            .update({
              pending: Math.max(0, log.wallets.pending - log.pi_amount),
              available: log.wallets.available + log.pi_amount
            })
            .eq('id', log.wallet_id)

          if (walletError) {
            console.error(`❌ Error updating wallet ${log.wallet_id}:`, walletError)
            errorCount++
            continue
          }

          // Cập nhật wallet log status
          const { error: logError } = await supabase
            .from('wallet_logs')
            .update({ 
              status: 'released',
              updated_at: new Date().toISOString()
            })
            .eq('id', log.id)

          if (logError) {
            console.error(`❌ Error updating log ${log.id}:`, logError)
            errorCount++
            continue
          }

          console.log(`✅ Successfully released ${log.pi_amount} PI for wallet ${log.wallet_id}`)
          processedCount++

        } catch (error) {
          console.error(`❌ Error processing log ${log.id}:`, error)
          errorCount++
        }
      }
    }

    const result = {
      success: true,
      message: `Wallet cron job completed`,
      processed: processedCount,
      errors: errorCount,
      total_found: pendingLogs?.length || 0,
      timestamp: new Date().toISOString()
    }

    console.log('🎉 Cron job completed:', result)

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('❌ Cron job error:', error)
    return new Response(JSON.stringify({
      success: false,
      error: 'Cron job failed',
      details: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
