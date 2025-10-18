
import { SepayWebhookPayload } from './types.ts'

export async function saveTransaction(transaction: SepayWebhookPayload, supabase: any) {
  const transactionId = `SEPAY_${transaction.id}`
  
  // Check if transaction already exists
  const { data: existing } = await supabase
    .from('casso_transactions')
    .select('id, processed')
    .eq('transaction_id', transactionId)
    .single()
  
  if (existing) {
    console.log(`ℹ️ [SEPAY] Transaction ${transactionId} already exists (processed: ${existing.processed})`)
    return { 
      transactionId, 
      insertResult: [existing],
      alreadyExists: true 
    }
  }
  
  // Insert new transaction
  const insertData = {
    transaction_id: transactionId,
    amount: transaction.transferAmount,
    description: transaction.content,
    when_occurred: transaction.transactionDate,
    account_number: transaction.accountNumber
  }

  console.log(`📝 [SEPAY] Inserting transaction:`, insertData)

  const { data: insertResult, error: saveError } = await supabase
    .from('casso_transactions')
    .insert(insertData)
    .select('*')

  if (saveError) {
    console.error('❌ [SEPAY] Error saving transaction:', saveError)
    throw new Error(`Failed to save transaction: ${saveError.message}`)
  }

  console.log(`✅ [SEPAY] Transaction saved successfully`)
  return { transactionId, insertResult, alreadyExists: false }
}

export async function linkTransactionToOrder(transactionId: string, orderId: string, supabase: any) {
  const { error: linkError } = await supabase
    .from('casso_transactions')
    .update({
      order_id: orderId,
      matched_at: new Date().toISOString(),
      processed: true
    })
    .eq('transaction_id', transactionId)

  if (linkError) {
    console.error('⚠️ [SEPAY] Error linking transaction to order:', linkError)
  } else {
    console.log(`✅ [SEPAY] Transaction linked to order: ${orderId}`)
  }
}

export async function saveUnmatchedTransaction(transaction: SepayWebhookPayload, transactionId: string, reason: string, supabase: any) {
  try {
    console.log(`💾 [SEPAY] Saving unmatched transaction: ${reason}`)
    
    const { error } = await supabase
      .from('unmatched_transactions')
      .insert({
        transaction_id: transactionId,
        amount: transaction.transferAmount,
        description: transaction.content,
        when_occurred: transaction.transactionDate,
        account_number: transaction.accountNumber,
        reason: reason
      })
    
    if (error) {
      console.error('❌ [SEPAY] Error saving unmatched transaction:', error)
    } else {
      console.log(`✅ [SEPAY] Unmatched transaction saved`)
    }
  } catch (error) {
    console.error('❌ [SEPAY] Error in saveUnmatchedTransaction:', error)
  }
}
