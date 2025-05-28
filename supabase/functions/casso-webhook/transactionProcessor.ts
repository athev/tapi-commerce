
import { CassoTransactionData } from './types.ts'
import { saveTransaction } from './transactionStorage.ts'
import { processOrderPayment } from './paymentProcessor.ts'

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
    await saveTransaction(transaction, transactionId, supabase)

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
