
import { CassoTransactionData } from './types.ts'
import { extractOrderId } from './orderIdExtractor.ts'
import { findMatchingOrder, verifyPaymentAmount } from './orderMatcher.ts'
import { updateOrderStatus, processOrderCompletion } from './orderUpdater.ts'
import { linkTransactionToOrder, saveUnmatchedTransaction } from './transactionStorage.ts'

export async function processOrderPayment(transaction: CassoTransactionData, transactionId: string, supabase: any) {
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
  const amountVerification = verifyPaymentAmount(transaction, order)
  
  if (!amountVerification.isValid) {
    const reason = `Amount mismatch: expected ${amountVerification.expectedAmount}, got ${amountVerification.receivedAmount}`
    console.log(`❌ ${reason}`)
    await saveUnmatchedTransaction(transaction, transactionId, reason, supabase)
    return {
      transaction_id: transactionId,
      status: 'amount_mismatch',
      expected: amountVerification.expectedAmount,
      received: amountVerification.receivedAmount
    }
  }

  // Update order status and process delivery
  try {
    await updateOrderStatus(order, transaction, transactionId, supabase)
    await linkTransactionToOrder(transactionId, order.id, supabase)
    return await processOrderCompletion(order, transaction, transactionId, supabase)
  } catch (error) {
    console.error(`❌ Error in order update and delivery:`, error)
    return {
      transaction_id: transactionId,
      status: 'processing_error',
      error: error.message
    }
  }
}
