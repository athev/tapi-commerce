import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { CassoTransactionData } from './types.ts'
import { extractOrderId, generateSearchPatterns, isOrderMatch } from './orderUtils.ts'
import { sendPaymentConfirmationEmail, sendSellerNotificationEmail } from './emailService.ts'
import { processAutomaticDelivery } from './deliveryService.ts'

export async function processTransaction(transaction: CassoTransactionData, supabase: any) {
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
      return {
        transaction_id: transactionId,
        status: 'already_processed'
      }
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
      return {
        transaction_id: transactionId,
        status: 'save_error',
        error: saveError.message
      }
    }

    console.log('✅ Transaction saved to database')

    // Extract order ID and process order
    return await processOrder(transaction, transactionId, supabase)

  } catch (error) {
    console.error(`❌ Error processing transaction ${transactionId}:`, error)
    return {
      transaction_id: transactionId,
      status: 'processing_error',
      error: error.message
    }
  }
}

async function processOrder(transaction: CassoTransactionData, transactionId: string, supabase: any) {
  // Extract order ID with improved patterns
  const extractedOrderId = extractOrderId(transaction.description)
  console.log(`🔍 Extracted order ID: "${extractedOrderId}"`)

  if (!extractedOrderId) {
    await saveUnmatchedTransaction(transaction, transactionId, 'Could not extract order ID from description', supabase)
    return {
      transaction_id: transactionId,
      status: 'no_order_found',
      description: transaction.description
    }
  }

  // Find matching order with flexible matching
  const order = await findMatchingOrderFlexible(extractedOrderId, supabase)
  
  if (!order) {
    console.log(`⚠️ Order not found for extracted ID: ${extractedOrderId}`)
    
    // Debug: show recent orders
    const { data: recentOrders } = await supabase
      .from('orders')
      .select('id, status, created_at')
      .order('created_at', { ascending: false })
      .limit(10)
    
    console.log('Recent orders for debugging:', recentOrders?.map(o => ({ 
      id: o.id, 
      short_id: o.id.slice(0, 8), 
      status: o.status,
      hex: o.id.replace(/-/g, '').slice(0, 8).toUpperCase()
    })))
    
    await saveUnmatchedTransaction(transaction, transactionId, `Order not found for ID: ${extractedOrderId}`, supabase)
    return {
      transaction_id: transactionId,
      status: 'order_not_found',
      extracted_order_id: extractedOrderId
    }
  }

  console.log(`✅ Found matching order: ${order.id}`)
  console.log(`📋 Order details:`, {
    status: order.status,
    product_type: order.products?.product_type,
    price: order.products?.price,
    created_at: order.created_at
  })

  // Verify amount with tolerance for small differences
  const expectedAmount = order.products?.price || 0
  const amountDifference = Math.abs(transaction.amount - expectedAmount)
  const tolerancePercent = 0.01 // 1% tolerance
  const tolerance = Math.max(1000, expectedAmount * tolerancePercent) // At least 1000 VND tolerance
  
  console.log(`💰 Amount verification:`, {
    expected: expectedAmount,
    received: transaction.amount,
    difference: amountDifference,
    tolerance: tolerance
  })
  
  if (amountDifference > tolerance) {
    const reason = transaction.amount < expectedAmount 
      ? `Insufficient amount: expected ${expectedAmount}, got ${transaction.amount}, difference: ${amountDifference}`
      : `Excess amount: expected ${expectedAmount}, got ${transaction.amount}, difference: ${amountDifference}`
      
    await saveUnmatchedTransaction(transaction, transactionId, reason, supabase)
    return {
      transaction_id: transactionId,
      status: 'amount_mismatch',
      expected: expectedAmount,
      received: transaction.amount,
      difference: amountDifference
    }
  }

  console.log(`✅ Amount verification passed`)

  // Update order status and process automatic delivery
  return await updateOrderAndProcess(order, transaction, transactionId, supabase)
}

// NEW: Tìm kiếm order linh hoạt với nhiều pattern
async function findMatchingOrderFlexible(extractedId: string, supabase: any) {
  console.log(`🔍 Flexible search for extracted ID: "${extractedId}"`)
  
  // Step 1: Try exact UUID match first
  if (extractedId.includes('-') && extractedId.length === 36) {
    console.log('🔍 Trying exact UUID match...')
    const { data: exactOrder } = await supabase
      .from('orders')
      .select(`
        id, status, user_id, product_id, buyer_email, created_at, payment_verified_at,
        products (id, title, price, seller_id, product_type, file_url)
      `)
      .eq('id', extractedId)
      .eq('status', 'pending')
      .is('payment_verified_at', null)
      .maybeSingle()
    
    if (exactOrder) {
      console.log(`✅ Found by exact UUID match`)
      return exactOrder
    }
  }
  
  // Step 2: Get all pending orders and check flexible matching
  console.log('🔍 Trying flexible matching with all pending orders...')
  const { data: pendingOrders, error } = await supabase
    .from('orders')
    .select(`
      id, status, user_id, product_id, buyer_email, created_at, payment_verified_at,
      products (id, title, price, seller_id, product_type, file_url)
    `)
    .eq('status', 'pending')
    .is('payment_verified_at', null)
    .order('created_at', { ascending: false })
    .limit(50) // Limit to recent orders for performance
  
  if (error) {
    console.error('❌ Error fetching pending orders:', error)
    return null
  }
  
  console.log(`🔍 Checking ${pendingOrders?.length || 0} pending orders...`)
  
  // Check each order for match
  for (const order of pendingOrders || []) {
    if (isOrderMatch(order.id, extractedId)) {
      console.log(`✅ Found flexible match: ${order.id}`)
      return order
    }
  }
  
  console.log(`❌ No flexible match found`)
  return null
}

async function updateOrderAndProcess(order: any, transaction: CassoTransactionData, transactionId: string, supabase: any) {
  try {
    console.log(`🔄 Starting complete order processing for: ${order.id}`)
    console.log(`📦 Product type: ${order.products?.product_type}`)
    
    // Update order status to paid first
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'paid',
        delivery_status: 'pending',
        payment_verified_at: new Date().toISOString(),
        bank_transaction_id: transactionId,
        bank_amount: transaction.amount,
        casso_transaction_id: transactionId, // Add this field
        updated_at: new Date().toISOString()
      })
      .eq('id', order.id)

    if (updateError) {
      console.error('❌ Error updating order status:', updateError)
      return {
        transaction_id: transactionId,
        status: 'order_update_error',
        error: updateError.message
      }
    }

    console.log(`✅ Order ${order.id} updated to paid status`)

    // Update transaction record with order link
    const { error: linkError } = await supabase
      .from('casso_transactions')
      .update({
        order_id: order.id,
        matched_at: new Date().toISOString(),
        processed: true
      })
      .eq('transaction_id', transactionId)

    if (linkError) {
      console.error('⚠️ Error linking transaction to order (non-critical):', linkError)
    }

    // Process automatic delivery
    console.log(`🚀 Starting automatic delivery process...`)
    const deliveryResult = await processAutomaticDelivery(order, supabase)
    console.log(`📦 Delivery result:`, deliveryResult)

    // Send email notifications (non-blocking)
    console.log(`📧 Sending email notifications...`)
    try {
      await Promise.allSettled([
        sendPaymentConfirmationEmail(order),
        sendSellerNotificationEmail(order)
      ])
      console.log(`✅ Email notifications sent`)
    } catch (emailError) {
      console.error('⚠️ Email notification error (non-critical):', emailError)
    }

    // Create notifications in database
    try {
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert([
          {
            user_id: order.user_id,
            title: 'Thanh toán thành công',
            message: `Đơn hàng ${order.products?.title} đã được thanh toán và xử lý thành công.`,
            type: 'payment_success',
            related_order_id: order.id
          },
          {
            user_id: order.products?.seller_id,
            title: 'Đơn hàng mới được thanh toán',
            message: `Đơn hàng ${order.products?.title} đã được thanh toán. ${deliveryResult.success ? 'Đã giao hàng tự động.' : 'Cần xử lý thủ công.'}`,
            type: 'new_order',
            related_order_id: order.id
          }
        ])

      if (notificationError) {
        console.error('⚠️ Error creating notifications (non-critical):', notificationError)
      } else {
        console.log(`✅ Notifications created`)
      }
    } catch (notifError) {
      console.error('⚠️ Notification creation error (non-critical):', notifError)
    }

    console.log(`🎉 Successfully processed transaction ${transactionId}`)
    
    return {
      transaction_id: transactionId,
      status: 'processed_successfully',
      order_id: order.id,
      amount: transaction.amount,
      delivery_status: deliveryResult.success ? 'auto_delivered' : 'manual_required',
      delivery_message: deliveryResult.message,
      product_type: order.products?.product_type
    }
    
  } catch (error) {
    console.error(`❌ Error in complete order processing:`, error)
    return {
      transaction_id: transactionId,
      status: 'processing_error',
      error: error.message
    }
  }
}

async function saveUnmatchedTransaction(transaction: CassoTransactionData, transactionId: string, reason: string, supabase: any) {
  try {
    const { error } = await supabase
      .from('unmatched_transactions')
      .insert({
        transaction_id: transactionId,
        amount: transaction.amount,
        description: transaction.description,
        when_occurred: transaction.when || new Date().toISOString(),
        account_number: transaction.bank_sub_acc_id || transaction.subAccId,
        reason: reason
      })
    
    if (error) {
      console.error('❌ Error saving unmatched transaction:', error)
    } else {
      console.log(`⚠️ Saved unmatched transaction: ${reason}`)
    }
  } catch (error) {
    console.error('❌ Error in saveUnmatchedTransaction:', error)
  }
}
