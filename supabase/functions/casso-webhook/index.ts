
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { CassoWebhookPayload, corsHeaders } from './types.ts'
import { extractOrderId } from './orderUtils.ts'
import { verifyCassoSignature } from './signatureVerification.ts'

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('=== CASSO WEBHOOK REQUEST START ===')
    console.log('Request method:', req.method)
    console.log('Request URL:', req.url)
    console.log('All headers:', Object.fromEntries(req.headers))

    // Get CASSO webhook secret from environment
    const cassoSecret = Deno.env.get('CASSO_WEBHOOK_SECRET')
    if (!cassoSecret) {
      console.error('CASSO_WEBHOOK_SECRET not configured')
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Server configuration error' 
      }), { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('CASSO secret configured, length:', cassoSecret.length)

    // Get signature from headers - theo tài liệu CASSO
    const signature = req.headers.get('secure-token') || req.headers.get('x-casso-signature')
    console.log('Signature found:', !!signature)
    if (signature) {
      console.log('Signature value:', signature)
    }

    // Get raw body text for signature verification
    const rawBody = await req.text()
    console.log('Raw body length:', rawBody.length)
    console.log('Raw body:', rawBody)

    // Parse JSON payload
    let payload: CassoWebhookPayload
    try {
      payload = JSON.parse(rawBody)
      console.log('Parsed payload structure:', {
        hasError: 'error' in payload,
        hasData: 'data' in payload,
        errorValue: payload.error,
        dataType: typeof payload.data,
        dataLength: Array.isArray(payload.data) ? payload.data.length : 'not array',
        keys: Object.keys(payload)
      })
    } catch (error) {
      console.error('Invalid JSON payload:', error)
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Invalid JSON payload' 
      }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Check if this is a test webhook (theo tài liệu CASSO)
    const isTestWebhook = !signature || 
                         (payload.data && payload.data.length > 0 && payload.data[0].id === 0) ||
                         (payload.data && payload.data.length > 0 && payload.data[0].description?.includes('test'))

    if (isTestWebhook) {
      console.log('🧪 Detected test webhook - skipping signature verification')
      return new Response(JSON.stringify({
        success: true,
        message: 'Test webhook received successfully',
        test: true,
        timestamp: new Date().toISOString()
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Verify CASSO signature for real transactions
    if (signature) {
      console.log('Starting signature verification...')
      const isValidSignature = await verifyCassoSignature(rawBody, signature, cassoSecret)
      
      if (!isValidSignature) {
        console.error('❌ SIGNATURE VERIFICATION FAILED')
        
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Invalid signature',
          debug: {
            signature_received: signature,
            payload_length: rawBody.length,
            secret_configured: !!cassoSecret,
            timestamp: new Date().toISOString()
          }
        }), { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
      console.log('✅ CASSO signature verified successfully')
    }

    // Check payload error
    if (payload.error && payload.error !== 0) {
      console.error('CASSO webhook error:', payload.error)
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'CASSO webhook error',
        casso_error: payload.error 
      }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Check if data exists and is array
    if (!payload.data || !Array.isArray(payload.data) || payload.data.length === 0) {
      console.error('No transaction data in payload')
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'No transaction data' 
      }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const processedTransactions = []
    
    // Process each transaction in the array
    for (const transaction of payload.data) {
      const transactionId = transaction.tid || transaction.id?.toString() || `casso_${Date.now()}`

      try {
        console.log(`🔄 Processing transaction: ${transactionId}`)
        console.log(`💰 Transaction amount: ${transaction.amount}`)
        console.log(`📝 Transaction description: ${transaction.description}`)
        
        // Check if transaction already exists
        const { data: existingTransaction } = await supabase
          .from('casso_transactions')
          .select('id')
          .eq('transaction_id', transactionId)
          .single()

        if (existingTransaction) {
          console.log(`✅ Transaction ${transactionId} already processed`)
          processedTransactions.push({
            transaction_id: transactionId,
            status: 'already_processed'
          })
          continue
        }

        // Save transaction to database first
        const { error: saveError } = await supabase
          .from('casso_transactions')
          .insert({
            transaction_id: transactionId,
            amount: transaction.amount,
            description: transaction.description,
            when_occurred: transaction.when || new Date().toISOString(),
            account_number: transaction.bank_sub_acc_id || transaction.subAccId
          })

        if (saveError) {
          console.error('❌ Error saving transaction:', saveError)
          continue
        }

        console.log('✅ Transaction saved to database')

        // Extract order ID from description
        const orderId = extractOrderId(transaction.description)
        console.log(`🔍 Extracted order ID: ${orderId} from description: "${transaction.description}"`)

        if (!orderId) {
          // Save to unmatched transactions
          await supabase
            .from('unmatched_transactions')
            .insert({
              transaction_id: transactionId,
              amount: transaction.amount,
              description: transaction.description,
              when_occurred: transaction.when || new Date().toISOString(),
              account_number: transaction.bank_sub_acc_id || transaction.subAccId,
              reason: 'Could not extract order ID from description'
            })
          
          console.log(`⚠️ No order ID found in description: ${transaction.description}`)
          processedTransactions.push({
            transaction_id: transactionId,
            status: 'no_order_found'
          })
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
          console.log(`❌ Order not found or not pending for ID: ${orderId}`)
          
          await supabase
            .from('unmatched_transactions')
            .insert({
              transaction_id: transactionId,
              amount: transaction.amount,
              description: transaction.description,
              when_occurred: transaction.when || new Date().toISOString(),
              account_number: transaction.bank_sub_acc_id || transaction.subAccId,
              reason: `Order ${orderId} not found or not pending`
            })
          
          processedTransactions.push({
            transaction_id: transactionId,
            status: 'order_not_found',
            order_id: orderId
          })
          continue
        }

        console.log(`✅ Found matching order:`, order)

        // Verify amount matches
        const expectedAmount = order.products?.price || 0
        console.log(`💰 Comparing amounts - Expected: ${expectedAmount}, Received: ${transaction.amount}`)
        
        if (transaction.amount < expectedAmount) {
          await supabase
            .from('unmatched_transactions')
            .insert({
              transaction_id: transactionId,
              amount: transaction.amount,
              description: transaction.description,
              when_occurred: transaction.when || new Date().toISOString(),
              account_number: transaction.bank_sub_acc_id || transaction.subAccId,
              reason: `Amount insufficient. Expected: ${expectedAmount}, Received: ${transaction.amount}`
            })
          
          console.log(`❌ Amount insufficient for order ${orderId}`)
          processedTransactions.push({
            transaction_id: transactionId,
            status: 'insufficient_amount',
            order_id: orderId,
            expected_amount: expectedAmount,
            received_amount: transaction.amount
          })
          continue
        }

        // Update order status and payment info
        const { error: updateError } = await supabase
          .from('orders')
          .update({
            status: 'paid',
            delivery_status: 'pending',
            payment_verified_at: new Date().toISOString(),
            bank_transaction_id: transactionId,
            bank_amount: transaction.amount
          })
          .eq('id', orderId)

        if (updateError) {
          console.error('❌ Error updating order:', updateError)
          continue
        }

        console.log(`✅ Successfully updated order ${orderId} to paid status`)

        // Update casso_transactions with matched order_id
        await supabase
          .from('casso_transactions')
          .update({
            order_id: orderId,
            matched_at: new Date().toISOString(),
            processed: true
          })
          .eq('transaction_id', transactionId)

        // Create notifications
        await supabase
          .from('notifications')
          .insert([
            {
              user_id: order.user_id,
              title: 'Thanh toán thành công',
              message: `Đơn hàng ${order.products?.title} đã được thanh toán thành công. Sản phẩm sẽ được giao trong ít phút.`,
              type: 'payment_success',
              related_order_id: orderId
            },
            {
              user_id: order.products?.seller_id,
              title: 'Có đơn hàng mới được thanh toán',
              message: `Đơn hàng ${order.products?.title} đã được thanh toán. Vui lòng xử lý giao hàng.`,
              type: 'new_order',
              related_order_id: orderId
            }
          ])

        console.log(`🎉 Successfully processed transaction ${transactionId} for order ${orderId}`)
        
        processedTransactions.push({
          transaction_id: transactionId,
          status: 'processed_successfully',
          order_id: orderId,
          amount: transaction.amount
        })

      } catch (error) {
        console.error(`❌ Error processing transaction ${transactionId}:`, error)
        processedTransactions.push({
          transaction_id: transactionId,
          status: 'processing_error',
          error: error.message
        })
      }
    }

    console.log('=== CASSO WEBHOOK REQUEST END ===')

    return new Response(JSON.stringify({
      success: true,
      message: 'Webhook processed successfully',
      total_transactions: payload.data.length,
      processed_transactions: processedTransactions,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('❌ Webhook error:', error)
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
