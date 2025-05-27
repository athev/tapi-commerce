
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CassoTransaction {
  transaction_id: string
  amount: number
  description: string
  when: string
  account_number: string
}

interface CassoWebhookPayload {
  data: CassoTransaction[]
}

// Hàm extract order ID từ description
function extractOrderId(description: string): string | null {
  // Tìm pattern DH#order_id hoặc Order#order_id
  const patterns = [
    /DH#([a-f0-9-]{36})/i,
    /Order#([a-f0-9-]{36})/i,
    /DH([a-f0-9-]{36})/i,
    /([a-f0-9-]{36})/i
  ]
  
  for (const pattern of patterns) {
    const match = description.match(pattern)
    if (match) {
      return match[1]
    }
  }
  
  return null
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verify authorization header
    const authHeader = req.headers.get('Authorization')
    const expectedToken = Deno.env.get('CASSO_WEBHOOK_TOKEN')
    
    if (!authHeader || !expectedToken) {
      console.error('Missing authorization header or token configuration')
      return new Response('Unauthorized', { 
        status: 401, 
        headers: corsHeaders 
      })
    }

    const bearerToken = authHeader.replace('Bearer ', '')
    if (bearerToken !== expectedToken) {
      console.error('Invalid authorization token')
      return new Response('Unauthorized', { 
        status: 401, 
        headers: corsHeaders 
      })
    }

    // Parse request body
    const payload: CassoWebhookPayload = await req.json()
    console.log('Received Casso webhook:', payload)

    if (!payload.data || !Array.isArray(payload.data)) {
      return new Response('Invalid payload format', { 
        status: 400, 
        headers: corsHeaders 
      })
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const processedTransactions = []
    const errors = []

    // Process each transaction
    for (const transaction of payload.data) {
      try {
        console.log(`Processing transaction: ${transaction.transaction_id}`)
        
        // Check if transaction already exists
        const { data: existingTransaction } = await supabase
          .from('casso_transactions')
          .select('id')
          .eq('transaction_id', transaction.transaction_id)
          .single()

        if (existingTransaction) {
          console.log(`Transaction ${transaction.transaction_id} already processed`)
          continue
        }

        // Save transaction to database first
        const { error: saveError } = await supabase
          .from('casso_transactions')
          .insert({
            transaction_id: transaction.transaction_id,
            amount: transaction.amount,
            description: transaction.description,
            when_occurred: transaction.when,
            account_number: transaction.account_number
          })

        if (saveError) {
          console.error('Error saving transaction:', saveError)
          errors.push(`Failed to save transaction ${transaction.transaction_id}`)
          continue
        }

        // Extract order ID from description
        const orderId = extractOrderId(transaction.description)
        console.log(`Extracted order ID: ${orderId} from description: ${transaction.description}`)

        if (!orderId) {
          // Save to unmatched transactions
          await supabase
            .from('unmatched_transactions')
            .insert({
              transaction_id: transaction.transaction_id,
              amount: transaction.amount,
              description: transaction.description,
              when_occurred: transaction.when,
              account_number: transaction.account_number,
              reason: 'Could not extract order ID from description'
            })
          
          console.log(`No order ID found in description: ${transaction.description}`)
          continue
        }

        // Find matching order
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .select(`
            id,
            status,
            user_id,
            products (
              id,
              title,
              price,
              seller_id
            )
          `)
          .eq('id', orderId)
          .eq('status', 'pending')
          .single()

        if (orderError || !order) {
          await supabase
            .from('unmatched_transactions')
            .insert({
              transaction_id: transaction.transaction_id,
              amount: transaction.amount,
              description: transaction.description,
              when_occurred: transaction.when,
              account_number: transaction.account_number,
              reason: `Order ${orderId} not found or not pending`
            })
          
          console.log(`Order ${orderId} not found or not pending`)
          continue
        }

        // Verify amount matches
        const expectedAmount = order.products?.price || 0
        if (transaction.amount !== expectedAmount) {
          await supabase
            .from('unmatched_transactions')
            .insert({
              transaction_id: transaction.transaction_id,
              amount: transaction.amount,
              description: transaction.description,
              when_occurred: transaction.when,
              account_number: transaction.account_number,
              reason: `Amount mismatch. Expected: ${expectedAmount}, Received: ${transaction.amount}`
            })
          
          console.log(`Amount mismatch for order ${orderId}. Expected: ${expectedAmount}, Received: ${transaction.amount}`)
          continue
        }

        // Update order status and payment info
        const { error: updateError } = await supabase
          .from('orders')
          .update({
            status: 'paid',
            delivery_status: 'pending',
            payment_verified_at: new Date().toISOString(),
            bank_transaction_id: transaction.transaction_id,
            bank_amount: transaction.amount
          })
          .eq('id', orderId)

        if (updateError) {
          console.error('Error updating order:', updateError)
          errors.push(`Failed to update order ${orderId}`)
          continue
        }

        // Update casso_transactions with matched order_id
        await supabase
          .from('casso_transactions')
          .update({
            order_id: orderId,
            matched_at: new Date().toISOString(),
            processed: true
          })
          .eq('transaction_id', transaction.transaction_id)

        // Create notification for buyer
        await supabase
          .from('notifications')
          .insert({
            user_id: order.user_id,
            title: 'Thanh toán thành công',
            message: `Đơn hàng ${order.products?.title} đã được thanh toán thành công. Sản phẩm sẽ được giao trong ít phút.`,
            type: 'payment_success',
            related_order_id: orderId
          })

        // Create notification for seller
        if (order.products?.seller_id) {
          await supabase
            .from('notifications')
            .insert({
              user_id: order.products.seller_id,
              title: 'Có đơn hàng mới được thanh toán',
              message: `Đơn hàng ${order.products?.title} đã được thanh toán. Vui lòng xử lý giao hàng.`,
              type: 'new_order',
              related_order_id: orderId
            })
        }

        processedTransactions.push({
          transaction_id: transaction.transaction_id,
          order_id: orderId,
          amount: transaction.amount,
          status: 'matched_and_processed'
        })

        console.log(`Successfully processed transaction ${transaction.transaction_id} for order ${orderId}`)

      } catch (error) {
        console.error(`Error processing transaction ${transaction.transaction_id}:`, error)
        errors.push(`Error processing transaction ${transaction.transaction_id}: ${error.message}`)
      }
    }

    const response = {
      success: true,
      processed_count: processedTransactions.length,
      error_count: errors.length,
      processed_transactions: processedTransactions,
      errors: errors
    }

    console.log('Webhook processing completed:', response)

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: error.message }), 
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
