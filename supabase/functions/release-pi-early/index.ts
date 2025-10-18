
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { orderId } = await req.json()
    console.log(`Processing early PI release for order: ${orderId}`)

    if (!orderId) {
      throw new Error('Order ID is required')
    }

    // Get order details with product info
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        products!inner(
          id,
          price,
          seller_id,
          title
        )
      `)
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      console.error('Order not found:', orderError)
      throw new Error(`Order not found: ${orderId}`)
    }

    console.log('Order found:', order)

    const sellerId = order.products.seller_id
    const orderAmount = order.products.price

    // Calculate PI amount (1 PI = 1000 VND)
    const piAmount = Math.floor(orderAmount / 1000)
    console.log(`Calculated PI amount: ${piAmount} PI for ${orderAmount} VND`)

    // Get or create seller wallet
    let { data: wallet, error: walletError } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', sellerId)
      .maybeSingle()

    if (walletError) {
      console.error('Error fetching wallet:', walletError)
      throw new Error(`Wallet fetch error: ${walletError.message}`)
    }

    if (!wallet) {
      console.log('Creating new wallet for seller:', sellerId)
      const { data: newWallet, error: createError } = await supabase
        .from('wallets')
        .insert({
          user_id: sellerId,
          pending: 0,
          available: 0,
          total_earned: 0
        })
        .select()
        .single()

      if (createError) {
        console.error('Error creating wallet:', createError)
        throw new Error(`Wallet creation error: ${createError.message}`)
      }

      wallet = newWallet
      console.log('New wallet created:', wallet.id)
    }

    // Check for existing wallet log
    console.log(`🔍 Checking for existing wallet log for order: ${orderId}`)
    const { data: existingLog, error: logError } = await supabase
      .from('wallet_logs')
      .select('*')
      .eq('order_id', orderId)
      .eq('type', 'earning')
      .maybeSingle()

    if (logError) {
      console.error('❌ Error checking wallet log:', logError)
      throw new Error(`Wallet log check error: ${logError.message}`)
    }

    let currentPending = Number(wallet.pending)
    let currentAvailable = Number(wallet.available)
    let currentTotal = Number(wallet.total_earned)

    console.log(`💰 Current wallet state:`, {
      pending: currentPending,
      available: currentAvailable,
      total_earned: currentTotal
    })

    // CASE 1: Log exists and is already released
    if (existingLog && existingLog.status === 'released') {
      console.log('✅ PI already released for this order')
      return new Response(JSON.stringify({
        success: true,
        message: 'PI already released',
        orderId,
        piAmount,
        released: true,
        alreadyProcessed: true
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // CASE 2: Log exists with pending status - move from pending to available
    if (existingLog && existingLog.status === 'pending') {
      console.log('📦 Moving PI from pending to available')
      
      const { error: updateError } = await supabase
        .from('wallets')
        .update({
          pending: currentPending - piAmount,
          available: currentAvailable + piAmount
        })
        .eq('id', wallet.id)

      if (updateError) {
        console.error('❌ Error updating wallet (pending → available):', updateError)
        throw new Error(`Wallet update error: ${updateError.message}`)
      }

      // Update wallet log status
      const { error: logUpdateError } = await supabase
        .from('wallet_logs')
        .update({
          status: 'released',
          updated_at: new Date().toISOString()
        })
        .eq('id', existingLog.id)

      if (logUpdateError) {
        console.error('⚠️ Error updating wallet log:', logUpdateError)
      }

      console.log('✅ Successfully moved PI from pending to available')
    } 
    // CASE 3: No log exists - add directly to available (old orders)
    else {
      console.log('💎 No wallet log found - creating new log with released status (old order)')
      
      const { error: updateError } = await supabase
        .from('wallets')
        .update({
          available: currentAvailable + piAmount,
          total_earned: currentTotal + piAmount
        })
        .eq('id', wallet.id)

      if (updateError) {
        console.error('❌ Error updating wallet (direct to available):', updateError)
        throw new Error(`Wallet update error: ${updateError.message}`)
      }

      // Create new wallet log as released
      const { error: createLogError } = await supabase
        .from('wallet_logs')
        .insert({
          wallet_id: wallet.id,
          order_id: orderId,
          type: 'earning',
          pi_amount: piAmount,
          vnd_amount: orderAmount,
          status: 'released',
          description: `Early release from order ${orderId.slice(0, 8)} (confirmed by buyer)`
        })

      if (createLogError) {
        console.error('⚠️ Error creating wallet log:', createLogError)
        // Don't throw - wallet update succeeded
      }

      console.log('✅ Successfully added PI directly to available')
    }

    console.log(`✅ PI successfully released early for order ${orderId}`)

    return new Response(JSON.stringify({
      success: true,
      message: 'PI released successfully',
      orderId,
      piAmount,
      released: true
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Early PI release error:', error)
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
