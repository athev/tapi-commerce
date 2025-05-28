
import { CassoTransactionData } from './types.ts'

export async function saveTransaction(transaction: CassoTransactionData, transactionId: string, supabase: any) {
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
    throw new Error(`Failed to save transaction: ${saveError.message}`)
  }

  console.log(`✅ Transaction saved successfully`)
  return insertResult
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
    console.error('⚠️ Error linking transaction to order:', linkError)
  } else {
    console.log(`✅ Transaction linked to order: ${orderId}`)
  }
}

export async function saveUnmatchedTransaction(transaction: CassoTransactionData, transactionId: string, reason: string, supabase: any) {
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
