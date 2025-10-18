
import { validateWalletProcessingConditions, calculatePIAmount } from './walletValidation.ts'
import { getOrCreateWallet, updateWalletEarnings } from './walletOperations.ts'
import { checkExistingWalletLog, createWalletLog } from './walletLogService.ts'

export async function processSellerEarning(order: any, bankAmount: number, supabase: any): Promise<any> {
  console.log(`💰 [WALLET SERVICE] Processing seller earning for order: ${order.id}`)
  console.log(`💰 [WALLET SERVICE] Bank amount: ${bankAmount} VNĐ`)
  
  // Step 1: Validate conditions
  const validation = validateWalletProcessingConditions(order, bankAmount)
  if (!validation.valid) {
    console.error(`❌ [WALLET SERVICE] Validation failed: ${validation.error}`)
    return { success: false, error: validation.error }
  }

  const sellerId = validation.sellerId
  console.log(`✅ [WALLET SERVICE] Processing for seller: ${sellerId}`)

  // Step 2: Calculate PI amount
  let piAmount: number
  try {
    piAmount = calculatePIAmount(bankAmount)
  } catch (error) {
    console.error(`❌ [WALLET SERVICE] PI calculation error:`, error)
    return { success: false, error: error.message }
  }

  // Step 3: Check if already processed for this order
  const existingLog = await checkExistingWalletLog(order.id, supabase)
  if (existingLog) {
    console.log(`⚠️ [WALLET SERVICE] Earning already processed for order ${order.id}`)
    return { 
      success: true, 
      skipped: true,
      message: 'Earning already processed',
      wallet_log_id: existingLog.id 
    }
  }

  // Step 4: Get or create wallet
  const { wallet, walletId, error: walletError } = await getOrCreateWallet(sellerId, supabase)
  if (walletError) {
    console.error(`❌ [WALLET SERVICE] Failed to get/create wallet:`, walletError)
    return { success: false, error: walletError }
  }

  console.log(`💼 [WALLET SERVICE] Current wallet state:`, {
    wallet_id: walletId,
    pending: wallet.pending,
    available: wallet.available,
    total_earned: wallet.total_earned
  })

  // Step 5: Update wallet with earnings
  const updateResult = await updateWalletEarnings(walletId, piAmount, wallet, supabase)
  if (!updateResult.success) {
    console.error(`❌ [WALLET SERVICE] Failed to update wallet:`, updateResult.error)
    return { success: false, error: updateResult.error }
  }

  // Step 6: Create wallet log
  const logResult = await createWalletLog(walletId, order.id, piAmount, bankAmount, supabase)
  if (!logResult.success) {
    console.error(`❌ [WALLET SERVICE] Failed to create wallet log:`, logResult.error)
    return { success: false, error: logResult.error }
  }

  console.log(`✅ [WALLET SERVICE] Successfully processed earning:`, {
    order_id: order.id,
    seller_id: sellerId,
    wallet_id: walletId,
    pi_amount: piAmount,
    vnd_amount: bankAmount,
    wallet_log_id: logResult.wallet_log_id,
    new_pending: updateResult.new_pending,
    new_total_earned: updateResult.new_total_earned
  })

  return {
    success: true,
    wallet_id: walletId,
    wallet_log_id: logResult.wallet_log_id,
    pi_amount: piAmount,
    vnd_amount: bankAmount
  }
}
