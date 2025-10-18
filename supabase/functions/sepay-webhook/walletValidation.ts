
export function validateWalletProcessingConditions(order: any, bankAmount: number) {
  console.log(`🔍 [WALLET VALIDATION] Validating wallet processing conditions...`);
  
  const sellerId = order.products?.seller_id;
  if (!sellerId) {
    console.error('❌ [WALLET VALIDATION] No seller ID found in order.products.seller_id');
    console.log('❌ [WALLET VALIDATION] Order structure:', JSON.stringify(order, null, 2));
    return { valid: false, error: 'No seller ID found' };
  }

  if (order.status !== 'paid') {
    console.log('⚠️ [WALLET VALIDATION] Order is not paid, current status:', order.status);
    return { valid: false, error: 'Order is not paid' };
  }

  if (!bankAmount || bankAmount <= 0) {
    console.error('❌ [WALLET VALIDATION] Invalid bank amount:', bankAmount);
    return { valid: false, error: 'Invalid bank amount' };
  }

  console.log(`✅ [WALLET VALIDATION] All conditions met for seller: ${sellerId}`);
  return { valid: true, sellerId };
}

export function calculatePIAmount(bankAmount: number) {
  // Tính PI amount (1 PI = 1000 VNĐ)
  const piAmount = Math.floor(bankAmount / 1000);
  console.log(`💰 [WALLET VALIDATION] PI Amount calculated: ${piAmount} PI from ${bankAmount} VNĐ (rate: 1 PI = 1000 VNĐ)`);

  if (piAmount <= 0) {
    console.error('❌ [WALLET VALIDATION] PI amount is zero or negative after calculation:', piAmount);
    throw new Error('PI amount is zero or negative');
  }

  return piAmount;
}
