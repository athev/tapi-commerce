
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
    console.log('=== CASSO WEBHOOK V2 REQUEST START ===')
    console.log('Request method:', req.method)
    console.log('Request URL:', req.url)
    console.log('All headers:', Object.fromEntries(req.headers))

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

      // Extract order ID from description
      const extractOrderId = (description: string): string | null => {
        if (!description) return null
        
        // Clean description
        const cleanDesc = description.trim().toLowerCase()
        console.log('Cleaned description:', cleanDesc)
        
        // Extract patterns for order ID
        const patterns = [
          /dh\s*([a-f0-9]{32})/i,
          /dh\s*([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i,
          /dh\s*([a-f0-9]{8,31})/i,
          /^([a-f0-9]{32})$/i,
          /^([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$/i
        ]
        
        for (const pattern of patterns) {
          const match = cleanDesc.match(pattern)
          if (match) {
            let extractedId = match[1].toLowerCase()
            console.log('Extracted order ID:', extractedId)
            
            // Normalize to UUID format if needed
            if (extractedId.length === 32 && !extractedId.includes('-')) {
              extractedId = [
                extractedId.slice(0, 8),
                extractedId.slice(8, 12),
                extractedId.slice(12, 16),
                extractedId.slice(16, 20),
                extractedId.slice(20, 32)
              ].join('-')
            }
            
            return extractedId
          }
        }
        
        return null
      }

      const orderId = extractOrderId(transaction.description)
      console.log('Extracted order ID:', orderId)

      if (!orderId) {
        console.log('⚠️ Could not extract order ID, saving as unmatched')
        
        // Save to unmatched transactions
        await supabase
          .from('unmatched_transactions')
          .insert({
            transaction_id: transaction.id?.toString() || `webhook_${Date.now()}`,
            amount: transaction.amount,
            description: transaction.description,
            when_occurred: transaction.transactionDateTime || new Date().toISOString(),
            account_number: transaction.accountNumber,
            reason: 'Could not extract order ID'
          })

        return new Response(JSON.stringify({
          success: true,
          message: 'Transaction saved as unmatched'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Find matching order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select(`
          id, status, user_id, product_id, buyer_email, created_at,
          products (id, title, price, seller_id, product_type)
        `)
        .eq('id', orderId)
        .eq('status', 'pending')
        .is('payment_verified_at', null)
        .maybeSingle()

      if (orderError) {
        console.error('Error finding order:', orderError)
        return new Response(JSON.stringify({
          success: false,
          error: 'Database error'
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      if (!order) {
        console.log('❌ Order not found, saving as unmatched')
        
        await supabase
          .from('unmatched_transactions')
          .insert({
            transaction_id: transaction.id?.toString() || `webhook_${Date.now()}`,
            amount: transaction.amount,
            description: transaction.description,
            when_occurred: transaction.transactionDateTime || new Date().toISOString(),
            account_number: transaction.accountNumber,
            reason: `Order not found: ${orderId}`
          })

        return new Response(JSON.stringify({
          success: true,
          message: 'Order not found, saved as unmatched'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Verify amount
      const expectedAmount = order.products?.price || 0
      const amountDifference = Math.abs(transaction.amount - expectedAmount)
      const tolerance = Math.max(1000, expectedAmount * 0.01)

      if (amountDifference > tolerance) {
        console.log('❌ Amount mismatch')
        
        await supabase
          .from('unmatched_transactions')
          .insert({
            transaction_id: transaction.id?.toString() || `webhook_${Date.now()}`,
            amount: transaction.amount,
            description: transaction.description,
            when_occurred: transaction.transactionDateTime || new Date().toISOString(),
            account_number: transaction.accountNumber,
            reason: `Amount mismatch: expected ${expectedAmount}, got ${transaction.amount}`
          })

        return new Response(JSON.stringify({
          success: true,
          message: 'Amount mismatch, saved as unmatched'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Process successful payment
      console.log('✅ Processing successful payment')

      // Save transaction
      const transactionId = transaction.id?.toString() || `webhook_${Date.now()}`
      await supabase
        .from('casso_transactions')
        .insert({
          transaction_id: transactionId,
          amount: transaction.amount,
          description: transaction.description,
          when_occurred: transaction.transactionDateTime || new Date().toISOString(),
          account_number: transaction.accountNumber,
          order_id: order.id,
          matched_at: new Date().toISOString(),
          processed: true
        })

      // Update order status
      await supabase
        .from('orders')
        .update({
          status: 'paid',
          delivery_status: 'processing',
          payment_verified_at: new Date().toISOString(),
          bank_transaction_id: transactionId,
          bank_amount: transaction.amount,
          casso_transaction_id: transactionId
        })
        .eq('id', order.id)

      // Create notifications
      await supabase
        .from('notifications')
        .insert([
          {
            user_id: order.user_id,
            title: 'Thanh toán thành công',
            message: `Đơn hàng "${order.products?.title}" đã được thanh toán thành công.`,
            type: 'payment_success',
            related_order_id: order.id
          },
          {
            user_id: order.products?.seller_id,
            title: 'Đơn hàng mới được thanh toán',
            message: `Đơn hàng "${order.products?.title}" đã được thanh toán thành công.`,
            type: 'new_order',
            related_order_id: order.id
          }
        ])

      console.log('🎉 Payment processing completed successfully')

      return new Response(JSON.stringify({
        success: true,
        message: 'Payment processed successfully',
        order_id: order.id,
        transaction_id: transactionId
      }), {
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
