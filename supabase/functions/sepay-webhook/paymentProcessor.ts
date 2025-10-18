import { SepayWebhookPayload, SepayProcessingResult } from './types.ts'
import { saveUnmatchedTransaction, linkTransactionToOrder } from './transactionStorage.ts'
import { extractOrderId } from './orderIdExtractor.ts'
import { findMatchingOrder, verifyPaymentAmount } from './orderMatcher.ts'
import { updateOrderStatus, processOrderCompletion } from './orderUpdater.ts'

// Reuse các module từ casso-webhook
export async function processOrderPayment(
  transaction: SepayWebhookPayload, 
  transactionId: string, 
  supabase: any
): Promise<SepayProcessingResult> {
  console.log(`🔍 [SEPAY] Starting order payment processing...`)

  // Extract order ID từ content (tương tự Casso)
  const extractedOrderId = extractOrderId(transaction.content)
  console.log(`🆔 [SEPAY] Extracted order ID: "${extractedOrderId}"`)

  if (!extractedOrderId) {
    console.log(`⚠️ [SEPAY] Could not extract order ID from: "${transaction.content}"`)
    await saveUnmatchedTransaction(transaction, transactionId, 'Could not extract order ID', supabase)
    return {
      transaction_id: transactionId,
      status: 'no_order_found',
      description: transaction.content
    }
  }

  // Find matching order
  const order = await findMatchingOrder(extractedOrderId, supabase)
  
  if (!order) {
    console.log(`❌ [SEPAY] Order not found for ID: ${extractedOrderId}`)
    await saveUnmatchedTransaction(transaction, transactionId, `Order not found: ${extractedOrderId}`, supabase)
    return {
      transaction_id: transactionId,
      status: 'order_not_found',
      extracted_order_id: extractedOrderId
    }
  }

  console.log(`✅ [SEPAY] Found order: ${order.id}`)

  // Convert SEPAY transaction to Casso format for verification
  const cassoFormatTransaction = {
    amount: transaction.transferAmount,
    description: transaction.content
  }

  // Verify amount matches
  const amountVerification = verifyPaymentAmount(cassoFormatTransaction, order)
  
  if (!amountVerification.isValid) {
    const reason = `Amount mismatch: expected ${amountVerification.expectedAmount}, got ${amountVerification.receivedAmount}`
    console.log(`❌ [SEPAY] ${reason}`)
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
    await updateOrderStatus(order, cassoFormatTransaction, transactionId, supabase)
    await linkTransactionToOrder(transactionId, order.id, supabase)
    
    const completionResult = await processOrderCompletion(order, cassoFormatTransaction, transactionId, supabase)
    
    // Return success with order info for wallet processing
    return {
      transaction_id: transactionId,
      status: 'success',
      order: order,
      transaction_amount: transaction.transferAmount,
      ...completionResult
    }
  } catch (error) {
    console.error(`❌ [SEPAY] Error in order update and delivery:`, error)
    return {
      transaction_id: transactionId,
      status: 'processing_error',
      error: error.message
    }
  }
}
