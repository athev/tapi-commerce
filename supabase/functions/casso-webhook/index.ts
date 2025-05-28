
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { CassoWebhookPayload, corsHeaders } from './types.ts'
import { extractOrderId } from './orderUtils.ts'
import { verifyCassoSignature } from './signatureVerification.ts'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Initialize response structure for consistent format
  const createResponse = (data: any, status = 200) => {
    return new Response(JSON.stringify(data), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  try {
    console.log('=== CASSO WEBHOOK REQUEST START ===')
    console.log('Request method:', req.method)
    console.log('Request URL:', req.url)
    console.log('All headers:', Object.fromEntries(req.headers))

    // Get CASSO webhook secret
    const cassoSecret = Deno.env.get('CASSO_WEBHOOK_SECRET')
    if (!cassoSecret) {
      console.error('❌ CASSO_WEBHOOK_SECRET not configured')
      return createResponse({ 
        success: false, 
        error: 'Server configuration error',
        timestamp: new Date().toISOString()
      }, 500)
    }

    console.log('✅ CASSO secret configured, length:', cassoSecret.length)

    // Get raw body for signature verification
    let rawBody: string
    try {
      rawBody = await req.text()
      console.log('✅ Raw body received, length:', rawBody.length)
      console.log('Raw body preview:', rawBody.substring(0, 200) + '...')
    } catch (error) {
      console.error('❌ Failed to read request body:', error)
      return createResponse({
        success: false,
        error: 'Failed to read request body',
        timestamp: new Date().toISOString()
      }, 400)
    }

    // Parse JSON payload
    let payload: CassoWebhookPayload
    try {
      if (!rawBody.trim()) {
        throw new Error('Empty request body')
      }
      payload = JSON.parse(rawBody)
      console.log('✅ JSON parsed successfully')
      console.log('Payload structure:', {
        hasError: 'error' in payload,
        hasData: 'data' in payload,
        errorValue: payload.error,
        dataType: typeof payload.data,
        dataLength: Array.isArray(payload.data) ? payload.data.length : 'not array'
      })
    } catch (error) {
      console.error('❌ Invalid JSON payload:', error)
      return createResponse({
        success: false,
        error: 'Invalid JSON payload',
        details: error.message,
        timestamp: new Date().toISOString()
      }, 400)
    }

    // Get signature for verification
    const signature = req.headers.get('x-casso-signature') || req.headers.get('secure-token')
    console.log('Signature found:', !!signature)
    if (signature) {
      console.log('Signature value:', signature.substring(0, 20) + '...')
    }

    // Check if this is a test webhook (no signature or test data)
    const isTestWebhook = !signature || 
                         (payload.data && payload.data.length > 0 && payload.data[0].id === 0) ||
                         (payload.data && payload.data.length > 0 && payload.data[0].description?.includes('test'))

    if (isTestWebhook) {
      console.log('🧪 Test webhook detected - skipping signature verification')
      return createResponse({
        success: true,
        message: 'Test webhook received successfully',
        test: true,
        timestamp: new Date().toISOString()
      })
    }

    // Verify CASSO signature for real transactions
    if (signature) {
      console.log('🔐 Starting signature verification...')
      try {
        const isValidSignature = await verifyCassoSignature(rawBody, signature, cassoSecret)
        
        if (!isValidSignature) {
          console.error('❌ SIGNATURE VERIFICATION FAILED')
          console.error('Raw body hash will be logged for debugging')
          
          return createResponse({
            success: false,
            error: 'Invalid signature',
            timestamp: new Date().toISOString()
          }, 401)
        }
        console.log('✅ CASSO signature verified successfully')
      } catch (signatureError) {
        console.error('❌ Error during signature verification:', signatureError)
        return createResponse({
          success: false,
          error: 'Signature verification failed',
          details: signatureError.message,
          timestamp: new Date().toISOString()
        }, 401)
      }
    } else {
      console.log('⚠️ No signature provided for real transaction')
      return createResponse({
        success: false,
        error: 'Missing signature for transaction',
        timestamp: new Date().toISOString()
      }, 400)
    }

    // Validate payload structure
    if (payload.error && payload.error !== 0) {
      console.error('❌ CASSO webhook error:', payload.error)
      return createResponse({
        success: false,
        error: 'CASSO webhook error',
        casso_error: payload.error,
        timestamp: new Date().toISOString()
      }, 400)
    }

    if (!payload.data || !Array.isArray(payload.data) || payload.data.length === 0) {
      console.error('❌ No transaction data in payload')
      return createResponse({
        success: false,
        error: 'No transaction data',
        timestamp: new Date().toISOString()
      }, 400)
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const processedTransactions = []
    
    // Process each transaction
    for (const transaction of payload.data) {
      const transactionId = transaction.tid || transaction.id?.toString() || `casso_${Date.now()}`

      try {
        console.log(`🔄 Processing transaction: ${transactionId}`)
        console.log(`💰 Amount: ${transaction.amount}`)
        console.log(`📝 Description: "${transaction.description}"`)
        
        // Check if already processed
        const { data: existingTransaction } = await supabase
          .from('casso_transactions')
          .select('id')
          .eq('transaction_id', transactionId)
          .maybeSingle()

        if (existingTransaction) {
          console.log(`✅ Transaction ${transactionId} already processed`)
          processedTransactions.push({
            transaction_id: transactionId,
            status: 'already_processed'
          })
          continue
        }

        // Save transaction first
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

        // Extract order ID
        const orderIdPattern = extractOrderId(transaction.description)
        console.log(`🔍 Extracted order pattern: "${orderIdPattern}"`)

        if (!orderIdPattern) {
          // Save to unmatched
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
          
          console.log(`⚠️ No order ID found in description`)
          processedTransactions.push({
            transaction_id: transactionId,
            status: 'no_order_found',
            description: transaction.description
          })
          continue
        }

        // Find matching order
        let order, orderError
        
        if (orderIdPattern.includes('%')) {
          // Pattern matching for new format
          console.log('🔍 Using pattern matching for order search...')
          const { data: orderData, error: orderErr } = await supabase
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
            .ilike('id', orderIdPattern)
            .eq('status', 'pending')
            .maybeSingle()
          
          order = orderData
          orderError = orderErr
        } else {
          // Exact match for old format
          console.log('🔍 Using exact match for order search...')
          const { data: orderData, error: orderErr } = await supabase
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
            .eq('id', orderIdPattern)
            .eq('status', 'pending')
            .maybeSingle()
          
          order = orderData
          orderError = orderErr
        }

        if (orderError) {
          console.error('❌ Error searching for order:', orderError)
          await supabase
            .from('unmatched_transactions')
            .insert({
              transaction_id: transactionId,
              amount: transaction.amount,
              description: transaction.description,
              when_occurred: transaction.when || new Date().toISOString(),
              account_number: transaction.bank_sub_acc_id || transaction.subAccId,
              reason: `Database error: ${orderError.message}`
            })
          continue
        }

        if (!order) {
          console.log(`❌ Order not found for pattern: "${orderIdPattern}"`)
          
          await supabase
            .from('unmatched_transactions')
            .insert({
              transaction_id: transactionId,
              amount: transaction.amount,
              description: transaction.description,
              when_occurred: transaction.when || new Date().toISOString(),
              account_number: transaction.bank_sub_acc_id || transaction.subAccId,
              reason: `Order not found or not pending: ${orderIdPattern}`
            })
          
          processedTransactions.push({
            transaction_id: transactionId,
            status: 'order_not_found',
            order_pattern: orderIdPattern
          })
          continue
        }

        console.log(`✅ Found matching order: ${order.id}`)

        // Verify amount
        const expectedAmount = order.products?.price || 0
        console.log(`💰 Amount check - Expected: ${expectedAmount}, Received: ${transaction.amount}`)
        
        if (transaction.amount !== expectedAmount) {
          const reason = transaction.amount < expectedAmount 
            ? `Insufficient amount: expected ${expectedAmount}, got ${transaction.amount}`
            : `Excess amount: expected ${expectedAmount}, got ${transaction.amount}`
            
          await supabase
            .from('unmatched_transactions')
            .insert({
              transaction_id: transactionId,
              amount: transaction.amount,
              description: transaction.description,
              when_occurred: transaction.when || new Date().toISOString(),
              account_number: transaction.bank_sub_acc_id || transaction.subAccId,
              reason: reason
            })
          
          console.log(`❌ Amount mismatch: ${reason}`)
          processedTransactions.push({
            transaction_id: transactionId,
            status: 'amount_mismatch',
            expected: expectedAmount,
            received: transaction.amount
          })
          continue
        }

        // Update order status
        const { error: updateError } = await supabase
          .from('orders')
          .update({
            status: 'paid',
            delivery_status: 'pending',
            payment_verified_at: new Date().toISOString(),
            bank_transaction_id: transactionId,
            bank_amount: transaction.amount
          })
          .eq('id', order.id)

        if (updateError) {
          console.error('❌ Error updating order:', updateError)
          continue
        }

        console.log(`✅ Order ${order.id} updated to paid status`)

        // Update transaction record
        await supabase
          .from('casso_transactions')
          .update({
            order_id: order.id,
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
              message: `Đơn hàng ${order.products?.title} đã được thanh toán thành công.`,
              type: 'payment_success',
              related_order_id: order.id
            },
            {
              user_id: order.products?.seller_id,
              title: 'Đơn hàng mới được thanh toán',
              message: `Đơn hàng ${order.products?.title} đã được thanh toán.`,
              type: 'new_order',
              related_order_id: order.id
            }
          ])

        console.log(`🎉 Successfully processed transaction ${transactionId}`)
        
        processedTransactions.push({
          transaction_id: transactionId,
          status: 'processed_successfully',
          order_id: order.id,
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

    console.log('=== PROCESSING COMPLETE ===')
    console.log('Total transactions:', payload.data.length)
    console.log('Results:', processedTransactions)

    // Always return success response to CASSO
    return createResponse({
      success: true,
      message: 'Webhook processed successfully',
      total_transactions: payload.data.length,
      processed_transactions: processedTransactions,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Webhook fatal error:', error)
    // Even on fatal error, return 200 to avoid CASSO retries
    return createResponse({
      success: false,
      error: 'Internal server error',
      details: error.message,
      timestamp: new Date().toISOString()
    })
  }
})
