
import { getOrCreateWallet, updateWalletEarnings } from './walletOperations.ts'
import { checkExistingWalletLog, createWalletLog } from './walletLogService.ts'
import { validateWalletProcessingConditions, calculatePIAmount } from './walletValidation.ts'

export async function processSellerEarning(order: any, bankAmount: number, supabase: any) {
  try {
    console.log(`🚀 [WALLET] === PROCESSING SELLER EARNING START ===`);
    console.log(`🚀 [WALLET] Order ID: ${order.id}`);
    console.log(`🚀 [WALLET] Bank Amount: ${bankAmount} VNĐ`);
    
    // 🔍 BƯỚC 1: Validate conditions
    const validation = validateWalletProcessingConditions(order, bankAmount);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const sellerId = validation.sellerId;
    console.log(`💰 [WALLET] Seller ID: ${sellerId}`);

    // 🔍 BƯỚC 2: Calculate PI amount
    const piAmount = calculatePIAmount(bankAmount);

    // 🔍 BƯỚC 3: Check for existing log to prevent duplicates
    const existingLog = await checkExistingWalletLog(order.id, supabase);
    if (existingLog) {
      return { 
        success: true, 
        message: 'Already processed', 
        logId: existingLog.id,
        piAmount: existingLog.pi_amount
      };
    }

    // 💰 BƯỚC 4: Get or create wallet
    const wallet = await getOrCreateWallet(sellerId, supabase);

    // 💰 BƯỚC 5: Update wallet with earnings
    const updatedWallet = await updateWalletEarnings(wallet.id, piAmount, wallet, supabase);

    // 📝 BƯỚC 6: Create wallet log
    const logResult = await createWalletLog(supabase, wallet.id, order.id, piAmount, bankAmount, sellerId);

    // 🎉 SUCCESS!
    console.log(`🎉 🎉 🎉 [WALLET] === SELLER EARNING PROCESSING COMPLETED SUCCESSFULLY ===`);
    console.log(`💎 [WALLET] Summary:`);
    console.log(`  - Seller ID: ${sellerId}`);
    console.log(`  - Order ID: ${order.id}`);
    console.log(`  - VND Amount: ${bankAmount}`);
    console.log(`  - PI Added: ${piAmount}`);
    console.log(`  - Wallet ID: ${updatedWallet.id}`);
    console.log(`  - New Pending: ${updatedWallet.pending}`);
    console.log(`  - New Total Earned: ${updatedWallet.total_earned}`);
    console.log(`  - Log ID: ${logResult.logId}`);
    console.log(`🎉 🎉 🎉 === END PROCESSING ===`);

    return { 
      success: true, 
      piAmount, 
      walletId: updatedWallet.id,
      logId: logResult.logId,
      message: `Successfully added ${piAmount} PI to seller wallet from order ${order.id}`
    };

  } catch (error) {
    console.error('💥 [WALLET] CRITICAL ERROR in processSellerEarning:', error);
    console.error('💥 [WALLET] Error stack:', error.stack);
    return { success: false, error: error.message || 'Unknown error' };
  }
}
