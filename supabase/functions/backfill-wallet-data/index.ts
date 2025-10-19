import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('🔄 [BACKFILL] Starting wallet data backfill...')

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verify admin role
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if user has admin role using user_roles table
    const { data: hasAdminRole, error: roleError } = await supabase
      .rpc('has_role', { _user_id: user.id, _role: 'admin' })

    if (roleError || !hasAdminRole) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Query orders that need backfill
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        id,
        status,
        bank_amount,
        created_at,
        products!inner (
          id,
          seller_id,
          price,
          title
        )
      `)
      .eq('status', 'paid')
      .not('bank_amount', 'is', null)
      .order('created_at', { ascending: true })

    if (ordersError) {
      console.error('❌ [BACKFILL] Error fetching orders:', ordersError)
      throw new Error(`Failed to fetch orders: ${ordersError.message}`)
    }

    console.log(`📊 [BACKFILL] Found ${orders?.length || 0} paid orders to check`)

    const results = {
      total_orders: orders?.length || 0,
      processed: 0,
      skipped: 0,
      errors: 0,
      details: [] as any[]
    }

    for (const order of orders || []) {
      try {
        // Check if wallet log already exists
        const { data: existingLog } = await supabase
          .from('wallet_logs')
          .select('id')
          .eq('order_id', order.id)
          .eq('type', 'earning')
          .maybeSingle()

        if (existingLog) {
          console.log(`⏭️ [BACKFILL] Order ${order.id} already has wallet log, skipping`)
          results.skipped++
          results.details.push({
            order_id: order.id,
            status: 'skipped',
            reason: 'Already has wallet log'
          })
          continue
        }

        // Calculate PI amount
        const bankAmount = order.bank_amount || order.products.price
        const piAmount = Math.floor(bankAmount / 1000)

        if (piAmount <= 0) {
          console.error(`❌ [BACKFILL] Invalid PI amount for order ${order.id}`)
          results.errors++
          results.details.push({
            order_id: order.id,
            status: 'error',
            reason: 'Invalid PI amount'
          })
          continue
        }

        const sellerId = order.products.seller_id

        // Get or create wallet
        let { data: wallet } = await supabase
          .from('wallets')
          .select('*')
          .eq('user_id', sellerId)
          .maybeSingle()

        if (!wallet) {
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
            console.error(`❌ [BACKFILL] Error creating wallet for seller ${sellerId}:`, createError)
            results.errors++
            continue
          }
          wallet = newWallet
        }

        // Update wallet
        const newPending = Number(wallet.pending) + piAmount
        const newTotalEarned = Number(wallet.total_earned) + piAmount

        const { error: updateError } = await supabase
          .from('wallets')
          .update({
            pending: newPending,
            total_earned: newTotalEarned,
            updated_at: new Date().toISOString()
          })
          .eq('id', wallet.id)

        if (updateError) {
          console.error(`❌ [BACKFILL] Error updating wallet:`, updateError)
          results.errors++
          continue
        }

        // Create wallet log
        const releaseDate = new Date(order.created_at)
        releaseDate.setDate(releaseDate.getDate() + 3)

        const { error: logError } = await supabase
          .from('wallet_logs')
          .insert({
            wallet_id: wallet.id,
            order_id: order.id,
            type: 'earning',
            status: 'pending',
            pi_amount: piAmount,
            vnd_amount: bankAmount,
            release_date: releaseDate.toISOString(),
            description: `Backfilled earning from order ${order.id.substring(0, 8)}`,
            created_at: order.created_at // Use original order date
          })

        if (logError) {
          console.error(`❌ [BACKFILL] Error creating wallet log:`, logError)
          results.errors++
          continue
        }

        console.log(`✅ [BACKFILL] Processed order ${order.id}: +${piAmount} PI`)
        results.processed++
        results.details.push({
          order_id: order.id,
          seller_id: sellerId,
          pi_amount: piAmount,
          vnd_amount: bankAmount,
          status: 'success'
        })

      } catch (error) {
        console.error(`❌ [BACKFILL] Error processing order ${order.id}:`, error)
        results.errors++
        results.details.push({
          order_id: order.id,
          status: 'error',
          reason: error.message
        })
      }
    }

    console.log('✅ [BACKFILL] Backfill completed:', results)

    return new Response(
      JSON.stringify({ 
        success: true,
        results
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('💥 [BACKFILL] Unexpected error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
