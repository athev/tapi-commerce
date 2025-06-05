
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
    console.log('=== PROCESSING OLD ORDERS START ===')
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Lấy tất cả orders đã paid nhưng chưa có wallet log
    console.log('🔍 Fetching paid orders without wallet logs...')
    
    const { data: paidOrders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        *,
        products!inner(
          id,
          title,
          price,
          seller_id,
          seller_name
        )
      `)
      .eq('status', 'paid')
      .not('bank_amount', 'is', null)
      .gt('bank_amount', 0)

    if (ordersError) {
      console.error('❌ Error fetching orders:', ordersError)
      throw ordersError
    }

    console.log(`📊 Found ${paidOrders?.length || 0} paid orders to check`)

    if (!paidOrders || paidOrders.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'No paid orders found to process',
        processed: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    let processedCount = 0
    let skippedCount = 0
    const results = []

    for (const order of paidOrders) {
      try {
        console.log(`\n🔄 Processing order: ${order.id}`)
        
        // Kiểm tra xem đã có wallet log chưa
        const { data: existingLog, error: logCheckError } = await supabase
          .from('wallet_logs')
          .select('id')
          .eq('order_id', order.id)
          .eq('type', 'earning')
          .maybeSingle()

        if (logCheckError) {
          console.error('❌ Error checking wallet log:', logCheckError)
          continue
        }

        if (existingLog) {
          console.log(`✅ Order ${order.id} already has wallet log, skipping`)
          skippedCount++
          continue
        }

        const sellerId = order.products?.seller_id
        const bankAmount = order.bank_amount

        if (!sellerId) {
          console.log(`⚠️ No seller ID found for order ${order.id}`)
          continue
        }

        if (!bankAmount || bankAmount <= 0) {
          console.log(`⚠️ Invalid bank amount for order ${order.id}: ${bankAmount}`)
          continue
        }

        // Tính PI amount
        const piAmount = Math.floor(bankAmount / 1000)
        console.log(`💰 PI Amount calculated: ${piAmount} PI from ${bankAmount} VNĐ`)

        if (piAmount <= 0) {
          console.log(`⚠️ PI amount is zero for order ${order.id}`)
          continue
        }

        // Lấy hoặc tạo wallet
        console.log(`🔍 Finding wallet for seller: ${sellerId}`)
        
        let { data: wallet, error: walletError } = await supabase
          .from('wallets')
          .select('*')
          .eq('user_id', sellerId)
          .maybeSingle()

        if (walletError) {
          console.error('❌ Error fetching wallet:', walletError)
          continue
        }

        if (!wallet) {
          console.log('🆕 Creating new wallet for seller')
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
            console.error('❌ Error creating wallet:', createError)
            continue
          }

          wallet = newWallet
        }

        // Cập nhật wallet
        const newPending = Number(wallet.pending) + piAmount
        const newTotalEarned = Number(wallet.total_earned) + piAmount
        
        console.log(`💵 Updating wallet:`)
        console.log(`  - Current pending: ${wallet.pending} → New pending: ${newPending}`)
        console.log(`  - Current total_earned: ${wallet.total_earned} → New total_earned: ${newTotalEarned}`)
        
        const { data: updatedWallet, error: updateError } = await supabase
          .from('wallets')
          .update({
            pending: newPending,
            total_earned: newTotalEarned,
            updated_at: new Date().toISOString()
          })
          .eq('id', wallet.id)
          .select()
          .single()

        if (updateError) {
          console.error('❌ Error updating wallet:', updateError)
          continue
        }

        // Tạo wallet log
        const releaseDate = new Date()
        releaseDate.setDate(releaseDate.getDate() + 3)

        console.log(`📝 Creating wallet log for order ${order.id}`)
        
        const { data: logResult, error: logError } = await supabase
          .from('wallet_logs')
          .insert({
            wallet_id: wallet.id,
            order_id: order.id,
            type: 'earning',
            pi_amount: piAmount,
            vnd_amount: bankAmount,
            status: 'pending',
            description: `Thu nhập từ đơn hàng ${order.id.slice(0, 8)}`,
            release_date: releaseDate.toISOString()
          })
          .select()
          .single()

        if (logError) {
          console.error('❌ Error creating wallet log:', logError)
          continue
        }

        console.log(`✅ Successfully processed order ${order.id}`)
        console.log(`  - Added ${piAmount} PI to seller ${sellerId}`)
        console.log(`  - Created wallet log: ${logResult.id}`)
        
        processedCount++
        results.push({
          orderId: order.id,
          sellerId: sellerId,
          piAmount: piAmount,
          vndAmount: bankAmount,
          walletLogId: logResult.id
        })

      } catch (error) {
        console.error(`💥 Error processing order ${order.id}:`, error)
        continue
      }
    }

    console.log(`\n🎉 PROCESSING COMPLETED`)
    console.log(`📊 Summary:`)
    console.log(`  - Total orders checked: ${paidOrders.length}`)
    console.log(`  - Orders processed: ${processedCount}`)
    console.log(`  - Orders skipped (already had logs): ${skippedCount}`)

    return new Response(JSON.stringify({
      success: true,
      message: `Successfully processed ${processedCount} orders`,
      totalChecked: paidOrders.length,
      processed: processedCount,
      skipped: skippedCount,
      results: results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('💥 PROCESSING ERROR:', error)
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error',
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
