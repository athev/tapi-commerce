
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
    console.log(`🔍 Checking if transaction ${transactionId} already exists...`)
    const { data: existingTransaction, error: checkError } = await supabase
      .from('casso_transactions')
      .select('id')
      .eq('transaction_id', transactionId)
      .maybeSingle()

    if (checkError) {
      console.error('❌ Error checking existing transaction:', checkError)
    }

    if (existingTransaction) {
      console.log(`✅ Transaction ${transactionId} already processed`)
      return {
        transaction_id: transactionId,
        status: 'already_processed'
      }
    }

    // Save transaction first
    const insertData = {
      transaction_id: transactionId,
      amount: transaction.amount,
      description: transaction.description,
      when_occurred: transaction.when || new Date().toISOString(),
      account_number: transaction.bank_sub_acc_id || transaction.subAccId
    }

    console.log(`📝 Inserting transaction:`, insertData)

    const { data: insertResult, error: saveError } = await supabase
      .from('casso_transactions')
      .insert(insertData)
      .select('*')

    if (saveError) {
      console.error('❌ Error saving transaction:', saveError)
      return {
        transaction_id: transactionId,
        status: 'save_error',
        error: saveError.message
      }
    }

    console.log(`✅ Transaction saved successfully`)

    // Process order payment
    return await processOrderPayment(transaction, transactionId, supabase)

  } catch (error) {
    console.error(`❌ Error processing transaction ${transactionId}:`, error)
    return {
      transaction_id: transactionId,
      status: 'processing_error',
      error: error.message
    }
  }
}

async function processOrderPayment(transaction: CassoTransactionData, transactionId: string, supabase: any) {
  console.log(`🔍 Starting order payment processing...`)
  
  // Extract order ID from description
  const extractedOrderId = extractOrderId(transaction.description)
  console.log(`🆔 Extracted order ID: "${extractedOrderId}"`)

  if (!extractedOrderId) {
    console.log(`⚠️ Could not extract order ID from: "${transaction.description}"`)
    await saveUnmatchedTransaction(transaction, transactionId, 'Could not extract order ID', supabase)
    return {
      transaction_id: transactionId,
      status: 'no_order_found',
      description: transaction.description
    }
  }

  // Find matching order
  const order = await findMatchingOrder(extractedOrderId, supabase)
  
  if (!order) {
    console.log(`❌ Order not found for ID: ${extractedOrderId}`)
    await saveUnmatchedTransaction(transaction, transactionId, `Order not found: ${extractedOrderId}`, supabase)
    return {
      transaction_id: transactionId,
      status: 'order_not_found',
      extracted_order_id: extractedOrderId
    }
  }

  console.log(`✅ Found order: ${order.id}`)

  // Verify amount matches
  const expectedAmount = order.products?.price || 0
  const amountDifference = Math.abs(transaction.amount - expectedAmount)
  const tolerance = Math.max(1000, expectedAmount * 0.01) // 1% tolerance or 1000 VND minimum
  
  if (amountDifference > tolerance) {
    const reason = `Amount mismatch: expected ${expectedAmount}, got ${transaction.amount}`
    console.log(`❌ ${reason}`)
    await saveUnmatchedTransaction(transaction, transactionId, reason, supabase)
    return {
      transaction_id: transactionId,
      status: 'amount_mismatch',
      expected: expectedAmount,
      received: transaction.amount
    }
  }

  console.log(`✅ Amount verified: ${transaction.amount} ≈ ${expectedAmount}`)

  // Update order status and process delivery
  return await updateOrderAndDelivery(order, transaction, transactionId, supabase)
}

async function findMatchingOrder(extractedId: string, supabase: any) {
  console.log(`🔍 Searching for order with ID patterns...`)
  
  // Try exact UUID match first
  if (extractedId.includes('-') && extractedId.length === 36) {
    const { data: exactOrder } = await supabase
      .from('orders')
      .select(`
        id, status, user_id, product_id, buyer_email, created_at,
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
  
  // Try flexible matching with pending orders
  const { data: pendingOrders } = await supabase
    .from('orders')
    .select(`
      id, status, user_id, product_id, buyer_email, created_at,
      products (id, title, price, seller_id, product_type, file_url)
    `)
    .eq('status', 'pending')
    .is('payment_verified_at', null)
    .order('created_at', { ascending: false })
    .limit(50)
  
  // Check each order for flexible match
  for (const order of pendingOrders || []) {
    if (isOrderMatch(order.id, extractedId)) {
      console.log(`✅ Found by flexible match: ${order.id}`)
      return order
    }
  }
  
  return null
}

async function updateOrderAndDelivery(order: any, transaction: CassoTransactionData, transactionId: string, supabase: any) {
  try {
    console.log(`🔄 Updating order ${order.id} to paid status...`)
    
    // Update order status
    const { data: updateData, error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'paid',
        delivery_status: 'processing',
        payment_verified_at: new Date().toISOString(),
        bank_transaction_id: transactionId,
        bank_amount: transaction.amount,
        casso_transaction_id: transactionId,
        updated_at: new Date().toISOString()
      })
      .eq('id', order.id)
      .select('*')

    if (updateError) {
      console.error('❌ Error updating order:', updateError)
      return {
        transaction_id: transactionId,
        status: 'order_update_error',
        error: updateError.message
      }
    }

    console.log(`✅ Order updated successfully`)

    // Link transaction to order
    const { error: linkError } = await supabase
      .from('casso_transactions')
      .update({
        order_id: order.id,
        matched_at: new Date().toISOString(),
        processed: true
      })
      .eq('transaction_id', transactionId)

    if (linkError) {
      console.error('⚠️ Error linking transaction to order:', linkError)
    }

    // Process automatic delivery
    console.log(`📦 Processing automatic delivery...`)
    const deliveryResult = await processAutomaticDelivery(order, supabase)
    
    // Send notifications
    await createNotifications(order, deliveryResult, supabase)
    
    // Send emails (non-blocking)
    Promise.allSettled([
      sendPaymentConfirmationEmail(order),
      sendSellerNotificationEmail(order)
    ]).catch(error => console.error('Email error:', error))

    console.log(`🎉 Payment processing completed successfully`)
    
    return {
      transaction_id: transactionId,
      status: 'processed_successfully',
      order_id: order.id,
      amount: transaction.amount,
      delivery_status: deliveryResult.success ? 'auto_delivered' : 'manual_required',
      product_type: order.products?.product_type
    }
    
  } catch (error) {
    console.error(`❌ Error in order update and delivery:`, error)
    return {
      transaction_id: transactionId,
      status: 'processing_error',
      error: error.message
    }
  }
}

async function createNotifications(order: any, deliveryResult: any, supabase: any) {
  try {
    const notifications = [
      {
        user_id: order.user_id,
        title: 'Thanh toán thành công',
        message: `Đơn hàng "${order.products?.title}" đã được thanh toán và ${deliveryResult.success ? 'giao hàng tự động' : 'đang được xử lý'}.`,
        type: 'payment_success',
        related_order_id: order.id
      },
      {
        user_id: order.products?.seller_id,
        title: 'Đơn hàng mới được thanh toán',
        message: `Đơn hàng "${order.products?.title}" đã được thanh toán thành công. ${deliveryResult.success ? 'Đã giao hàng tự động.' : 'Cần xử lý giao hàng thủ công.'}`,
        type: 'new_order',
        related_order_id: order.id
      }
    ]

    const { error } = await supabase
      .from('notifications')
      .insert(notifications)

    if (error) {
      console.error('⚠️ Error creating notifications:', error)
    } else {
      console.log(`✅ Notifications created`)
    }
  } catch (error) {
    console.error('⚠️ Notification creation error:', error)
  }
}

async function saveUnmatchedTransaction(transaction: CassoTransactionData, transactionId: string, reason: string, supabase: any) {
  try {
    console.log(`💾 Saving unmatched transaction: ${reason}`)
    
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
      console.log(`✅ Unmatched transaction saved`)
    }
  } catch (error) {
    console.error('❌ Error in saveUnmatchedTransaction:', error)
  }
}
