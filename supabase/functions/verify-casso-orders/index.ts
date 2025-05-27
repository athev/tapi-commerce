
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
    console.log('Starting Casso orders verification job...')

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Find pending orders older than 30 minutes
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString()
    
    const { data: pendingOrders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        id,
        status,
        created_at,
        user_id,
        products (
          id,
          title,
          price,
          seller_id
        )
      `)
      .eq('status', 'pending')
      .lt('created_at', thirtyMinutesAgo)

    if (ordersError) {
      throw new Error(`Error fetching pending orders: ${ordersError.message}`)
    }

    if (!pendingOrders || pendingOrders.length === 0) {
      console.log('No pending orders found for verification')
      return new Response(JSON.stringify({
        success: true,
        message: 'No pending orders found for verification',
        processed_count: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log(`Found ${pendingOrders.length} pending orders to verify`)

    let processedCount = 0
    const errors = []

    // Check each pending order against unmatched transactions
    for (const order of pendingOrders) {
      try {
        // Look for unmatched transactions that might belong to this order
        const { data: unmatchedTransactions, error: unmatchedError } = await supabase
          .from('unmatched_transactions')
          .select('*')
          .ilike('description', `%${order.id}%`)

        if (unmatchedError) {
          console.error(`Error checking unmatched transactions for order ${order.id}:`, unmatchedError)
          continue
        }

        if (unmatchedTransactions && unmatchedTransactions.length > 0) {
          for (const transaction of unmatchedTransactions) {
            // Verify amount matches
            const expectedAmount = order.products?.price || 0
            if (transaction.amount === expectedAmount) {
              console.log(`Found matching transaction for order ${order.id}`)

              // Update order status
              const { error: updateError } = await supabase
                .from('orders')
                .update({
                  status: 'paid',
                  delivery_status: 'pending',
                  payment_verified_at: new Date().toISOString(),
                  bank_transaction_id: transaction.transaction_id,
                  bank_amount: transaction.amount
                })
                .eq('id', order.id)

              if (updateError) {
                console.error(`Error updating order ${order.id}:`, updateError)
                continue
              }

              // Move transaction to matched
              await supabase
                .from('casso_transactions')
                .insert({
                  transaction_id: transaction.transaction_id,
                  amount: transaction.amount,
                  description: transaction.description,
                  when_occurred: transaction.when_occurred,
                  account_number: transaction.account_number,
                  order_id: order.id,
                  matched_at: new Date().toISOString(),
                  processed: true
                })

              // Remove from unmatched
              await supabase
                .from('unmatched_transactions')
                .delete()
                .eq('id', transaction.id)

              // Create notifications
              await supabase
                .from('notifications')
                .insert([
                  {
                    user_id: order.user_id,
                    title: 'Thanh toán đã được xác nhận',
                    message: `Đơn hàng ${order.products?.title} đã được xác nhận thanh toán thành công.`,
                    type: 'payment_verified',
                    related_order_id: order.id
                  },
                  {
                    user_id: order.products?.seller_id,
                    title: 'Đơn hàng được xác nhận thanh toán',
                    message: `Đơn hàng ${order.products?.title} đã được xác nhận thanh toán. Vui lòng xử lý giao hàng.`,
                    type: 'order_verified',
                    related_order_id: order.id
                  }
                ])

              processedCount++
              console.log(`Successfully verified and processed order ${order.id}`)
              break // Only process the first matching transaction
            }
          }
        }

      } catch (error) {
        console.error(`Error processing order ${order.id}:`, error)
        errors.push(`Error processing order ${order.id}: ${error.message}`)
      }
    }

    const response = {
      success: true,
      message: `Verification job completed`,
      total_pending_orders: pendingOrders.length,
      processed_count: processedCount,
      error_count: errors.length,
      errors: errors
    }

    console.log('Verification job completed:', response)

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Verification job error:', error)
    return new Response(
      JSON.stringify({ error: error.message }), 
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
