
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

    // Get signature from header
    const signature = req.headers.get('x-casso-signature')
    
    // Get raw body text for signature verification
    const rawBody = await req.text()
    console.log('Received webhook payload:', rawBody)

    // Verify CASSO signature only if signature is provided
    if (signature) {
      const isValidSignature = await verifyCassoSignature(rawBody, signature, cassoSecret)
      if (!isValidSignature) {
        console.error('Invalid CASSO signature')
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Invalid signature' 
        }), { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
      console.log('CASSO signature verified successfully')
    } else {
      console.log('No signature provided - proceeding without verification (test mode)')
    }

    // Parse JSON payload after verification
    let payload: CassoWebhookPayload
    try {
      payload = JSON.parse(rawBody)
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

    console.log('Received Casso webhook:', payload)

    // Check if payload has error
    if (payload.error !== 0) {
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

    // Check if data exists
    if (!payload.data) {
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

    const transaction = payload.data
    const transactionId = transaction.reference || transaction.id.toString()

    try {
      console.log(`Processing transaction: ${transactionId}`)
      console.log(`Transaction description: ${transaction.description}`)
      console.log(`Transaction amount: ${transaction.amount}`)
      
      // Check if transaction already exists
      const { data: existingTransaction } = await supabase
        .from('casso_transactions')
        .select('id')
        .eq('transaction_id', transactionId)
        .single()

      if (existingTransaction) {
        console.log(`Transaction ${transactionId} already processed`)
        return new Response(JSON.stringify({
          success: true,
          message: 'Transaction already processed',
          transaction_id: transactionId
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      // Save transaction to database first
      const { error: saveError } = await supabase
        .from('casso_transactions')
        .insert({
          transaction_id: transactionId,
          amount: transaction.amount,
          description: transaction.description,
          when_occurred: transaction.transactionDateTime,
          account_number: transaction.accountNumber
        })

      if (saveError) {
        console.error('Error saving transaction:', saveError)
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Failed to save transaction',
          details: saveError.message 
        }), { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Extract and normalize order ID from description
      const orderId = extractOrderId(transaction.description)
      console.log(`Final processed order ID: ${orderId} from description: ${transaction.description}`)

      if (!orderId) {
        // Save to unmatched transactions
        await supabase
          .from('unmatched_transactions')
          .insert({
            transaction_id: transactionId,
            amount: transaction.amount,
            description: transaction.description,
            when_occurred: transaction.transactionDateTime,
            account_number: transaction.accountNumber,
            reason: 'Could not extract order ID from description'
          })
        
        console.log(`No order ID found in description: ${transaction.description}`)
        return new Response(JSON.stringify({
          success: true,
          message: 'Transaction saved but no matching order found',
          transaction_id: transactionId
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      // Find matching order with normalized order ID
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
        console.log(`Order query error:`, orderError)
        console.log(`Order not found or not pending for ID: ${orderId}`)
        
        await supabase
          .from('unmatched_transactions')
          .insert({
            transaction_id: transactionId,
            amount: transaction.amount,
            description: transaction.description,
            when_occurred: transaction.transactionDateTime,
            account_number: transaction.accountNumber,
            reason: `Order ${orderId} not found or not pending`
          })
        
        return new Response(JSON.stringify({
          success: true,
          message: 'Transaction saved but order not found or not pending',
          transaction_id: transactionId,
          order_id: orderId
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      console.log(`Found matching order:`, order)

      // Verify amount matches (allow equal or greater)
      const expectedAmount = order.products?.price || 0
      console.log(`Comparing amounts - Expected: ${expectedAmount}, Received: ${transaction.amount}`)
      
      if (transaction.amount < expectedAmount) {
        await supabase
          .from('unmatched_transactions')
          .insert({
            transaction_id: transactionId,
            amount: transaction.amount,
            description: transaction.description,
            when_occurred: transaction.transactionDateTime,
            account_number: transaction.accountNumber,
            reason: `Amount insufficient. Expected: ${expectedAmount}, Received: ${transaction.amount}`
          })
        
        console.log(`Amount insufficient for order ${orderId}. Expected: ${expectedAmount}, Received: ${transaction.amount}`)
        return new Response(JSON.stringify({
          success: true,
          message: 'Transaction saved but amount insufficient',
          transaction_id: transactionId,
          order_id: orderId,
          expected_amount: expectedAmount,
          received_amount: transaction.amount
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
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
        console.error('Error updating order:', updateError)
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Failed to update order',
          details: updateError.message 
        }), { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      console.log(`Successfully updated order ${orderId} to paid status`)

      // Update casso_transactions with matched order_id
      await supabase
        .from('casso_transactions')
        .update({
          order_id: orderId,
          matched_at: new Date().toISOString(),
          processed: true
        })
        .eq('transaction_id', transactionId)

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

      console.log(`Successfully processed transaction ${transactionId} for order ${orderId}`)

      return new Response(JSON.stringify({
        success: true,
        message: 'Transaction processed successfully',
        transaction_id: transactionId,
        order_id: orderId,
        amount: transaction.amount,
        status: 'matched_and_processed'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })

    } catch (error) {
      console.error(`Error processing transaction ${transactionId}:`, error)
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Internal server error',
        details: error.message 
      }), { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

  } catch (error) {
    console.error('Webhook error:', error)
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
