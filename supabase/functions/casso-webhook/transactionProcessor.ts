
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { CassoTransactionData } from './types.ts'
import { extractOrderId } from './orderUtils.ts'

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
  // Extract order ID
  const orderIdPattern = extractOrderId(transaction.description)
  console.log(`🔍 Extracted order pattern: "${orderIdPattern}"`)

  if (!orderIdPattern) {
    await saveUnmatchedTransaction(transaction, transactionId, 'Could not extract order ID from description', supabase)
    return {
      transaction_id: transactionId,
      status: 'no_order_found',
      description: transaction.description
    }
  }

  // Find matching order
  const order = await findMatchingOrder(orderIdPattern, supabase)
  
  if (!order) {
    await saveUnmatchedTransaction(transaction, transactionId, `Order not found or not pending: ${orderIdPattern}`, supabase)
    return {
      transaction_id: transactionId,
      status: 'order_not_found',
      order_pattern: orderIdPattern
    }
  }

  console.log(`✅ Found matching order: ${order.id}`)

  // Verify amount
  const expectedAmount = order.products?.price || 0
  console.log(`💰 Amount check - Expected: ${expectedAmount}, Received: ${transaction.amount}`)
  
  if (transaction.amount !== expectedAmount) {
    const reason = transaction.amount < expectedAmount 
      ? `Insufficient amount: expected ${expectedAmount}, got ${transaction.amount}`
      : `Excess amount: expected ${expectedAmount}, got ${transaction.amount}`
      
    await saveUnmatchedTransaction(transaction, transactionId, reason, supabase)
    return {
      transaction_id: transactionId,
      status: 'amount_mismatch',
      expected: expectedAmount,
      received: transaction.amount
    }
  }

  // Update order status and create notifications
  return await updateOrderAndNotify(order, transaction, transactionId, supabase)
}

async function findMatchingOrder(orderIdPattern: string, supabase: any) {
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
    return null
  }

  return order
}

async function updateOrderAndNotify(order: any, transaction: CassoTransactionData, transactionId: string, supabase: any) {
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
    return {
      transaction_id: transactionId,
      status: 'order_update_error',
      error: updateError.message
    }
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
  
  return {
    transaction_id: transactionId,
    status: 'processed_successfully',
    order_id: order.id,
    amount: transaction.amount
  }
}

async function saveUnmatchedTransaction(transaction: CassoTransactionData, transactionId: string, reason: string, supabase: any) {
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
  
  console.log(`⚠️ Saved unmatched transaction: ${reason}`)
}
