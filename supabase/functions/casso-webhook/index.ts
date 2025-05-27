import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-casso-signature',
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

// Hàm normalize order ID từ 32 ký tự thành UUID chuẩn
function normalizeOrderId(id: string): string {
  console.log('Normalizing order ID:', id)
  
  // Nếu đã có dấu gạch ngang hoặc không phải 32 ký tự, trả về nguyên
  if (id.includes('-') || id.length !== 32) {
    console.log('Order ID already normalized or invalid length:', id)
    return id
  }
  
  // Chuyển đổi 32 ký tự thành UUID chuẩn
  const normalized = [
    id.slice(0, 8),
    id.slice(8, 12),
    id.slice(12, 16),
    id.slice(16, 20),
    id.slice(20, 32)
  ].join('-')
  
  console.log('Normalized order ID from', id, 'to', normalized)
  return normalized
}

// Hàm extract order ID từ description - cải thiện để xử lý nhiều format hơn
function extractOrderId(description: string): string | null {
  console.log('Extracting order ID from description:', description)
  
  // Tìm pattern DH#order_id hoặc DHorder_id (có thể có hoặc không có dấu #)
  const patterns = [
    // Pattern có dấu # và dấu gạch ngang
    /DH#([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i,
    // Pattern có DH nhưng không có dấu #, có dấu gạch ngang
    /DH([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i,
    // Pattern chỉ có UUID với dấu gạch ngang
    /([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i,
    // Pattern có DH# nhưng UUID không có dấu gạch ngang (32 ký tự liền)
    /DH#([a-f0-9]{32})/i,
    // Pattern có DH nhưng UUID không có dấu gạch ngang (32 ký tự liền)
    /DH([a-f0-9]{32})/i,
    // Pattern chỉ có UUID không dấu gạch ngang (32 ký tự liền)
    /([a-f0-9]{32})/i
  ]
  
  for (const pattern of patterns) {
    const match = description.match(pattern)
    if (match) {
      let extractedId = match[1]
      console.log('Raw extracted ID:', extractedId)
      
      // Normalize UUID (thêm dấu gạch ngang nếu cần)
      const normalizedId = normalizeOrderId(extractedId)
      
      console.log('Successfully extracted and normalized order ID:', normalizedId)
      return normalizedId
    }
  }
  
  console.log('No order ID found in description')
  return null
}

// Hàm verify CASSO signature theo HMAC-SHA256
async function verifyCassoSignature(payload: string, signature: string, secret: string): Promise<boolean> {
  if (!signature || !secret) {
    console.error('Missing signature or secret for verification')
    return false
  }

  try {
    console.log('Verifying CASSO signature...')
    
    // Tạo HMAC-SHA256 signature
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )
    
    const signatureBytes = await crypto.subtle.sign('HMAC', key, encoder.encode(payload))
    const expectedSignature = Array.from(new Uint8Array(signatureBytes))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
    
    // So sánh signature (remove prefix nếu có)
    const receivedSignature = signature.replace(/^sha256=/, '')
    const isValid = expectedSignature === receivedSignature
    
    console.log('Signature verification result:', isValid)
    console.log('Expected signature:', expectedSignature)
    console.log('Received signature:', receivedSignature)
    
    return isValid
  } catch (error) {
    console.error('Error verifying CASSO signature:', error)
    return false
  }
}

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
      return new Response('Server configuration error', { 
        status: 500, 
        headers: corsHeaders 
      })
    }

    // Get signature from header
    const signature = req.headers.get('x-casso-signature')
    if (!signature) {
      console.error('Missing x-casso-signature header')
      return new Response('Missing signature', { 
        status: 401, 
        headers: corsHeaders 
      })
    }

    // Get raw body text for signature verification
    const rawBody = await req.text()
    console.log('Received webhook payload:', rawBody)

    // Verify CASSO signature
    const isValidSignature = await verifyCassoSignature(rawBody, signature, cassoSecret)
    if (!isValidSignature) {
      console.error('Invalid CASSO signature')
      return new Response('Invalid signature', { 
        status: 401, 
        headers: corsHeaders 
      })
    }

    console.log('CASSO signature verified successfully')

    // Parse JSON payload after verification
    let payload: CassoWebhookPayload
    try {
      payload = JSON.parse(rawBody)
    } catch (error) {
      console.error('Invalid JSON payload:', error)
      return new Response('Invalid JSON payload', { 
        status: 400, 
        headers: corsHeaders 
      })
    }

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
        console.log(`Transaction description: ${transaction.description}`)
        console.log(`Transaction amount: ${transaction.amount}`)
        
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

        // Extract and normalize order ID from description
        const orderId = extractOrderId(transaction.description)
        console.log(`Final processed order ID: ${orderId} from description: ${transaction.description}`)

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

        console.log(`Found matching order:`, order)

        // Verify amount matches (allow equal or greater)
        const expectedAmount = order.products?.price || 0
        console.log(`Comparing amounts - Expected: ${expectedAmount}, Received: ${transaction.amount}`)
        
        if (transaction.amount < expectedAmount) {
          await supabase
            .from('unmatched_transactions')
            .insert({
              transaction_id: transaction.transaction_id,
              amount: transaction.amount,
              description: transaction.description,
              when_occurred: transaction.when,
              account_number: transaction.account_number,
              reason: `Amount insufficient. Expected: ${expectedAmount}, Received: ${transaction.amount}`
            })
          
          console.log(`Amount insufficient for order ${orderId}. Expected: ${expectedAmount}, Received: ${transaction.amount}`)
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

        console.log(`Successfully updated order ${orderId} to paid status`)

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
