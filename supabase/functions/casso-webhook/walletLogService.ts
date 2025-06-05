
export async function checkExistingWalletLog(orderId: string, supabase: any) {
  console.log(`🔍 [WALLET LOG] Checking for existing wallet log for order: ${orderId}`);
  
  const { data: existingLog, error: logCheckError } = await supabase
    .from('wallet_logs')
    .select('*')
    .eq('order_id', orderId)
    .eq('type', 'earning')
    .maybeSingle();

  if (logCheckError) {
    console.error('❌ [WALLET LOG] Error checking existing wallet log:', logCheckError);
    throw new Error(`Error checking existing wallet log: ${logCheckError.message}`);
  }

  if (existingLog) {
    console.log('✅ [WALLET LOG] Wallet log already exists for this order, skipping duplicate processing');
    console.log('📋 [WALLET LOG] Existing log details:', existingLog);
    return existingLog;
  }

  console.log('✅ [WALLET LOG] No existing log found, proceeding with wallet processing...');
  return null;
}

export async function createWalletLog(supabase: any, walletId: string, orderId: string, piAmount: number, vndAmount: number, sellerId: string) {
  try {
    // Tính release date (3 ngày sau)
    const releaseDate = new Date();
    releaseDate.setDate(releaseDate.getDate() + 3);

    console.log(`📝 [WALLET LOG] Creating wallet log...`);
    console.log(`📝 [WALLET LOG] Details:`);
    console.log(`  - Wallet ID: ${walletId}`);
    console.log(`  - Order ID: ${orderId}`);
    console.log(`  - Seller ID: ${sellerId}`);
    console.log(`  - PI Amount: ${piAmount}`);
    console.log(`  - VND Amount: ${vndAmount}`);
    console.log(`  - Release Date: ${releaseDate.toISOString()}`);

    const { data: logResult, error } = await supabase
      .from('wallet_logs')
      .insert({
        wallet_id: walletId,
        order_id: orderId,
        type: 'earning',
        pi_amount: piAmount,
        vnd_amount: vndAmount,
        status: 'pending',
        description: `Thu nhập từ đơn hàng ${orderId.slice(0, 8)}`,
        release_date: releaseDate.toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('❌ [WALLET LOG] Error creating wallet log:', error);
      throw new Error(`Error creating wallet log: ${error.message}`);
    }

    console.log(`✅ [WALLET LOG] Wallet log created successfully:`, {
      logId: logResult.id,
      sellerId: sellerId,
      orderId: orderId,
      piAmount: piAmount,
      vndAmount: vndAmount,
      releaseDate: releaseDate.toISOString()
    });

    return { success: true, logId: logResult.id };
  } catch (error) {
    console.error('💥 [WALLET LOG] Error in createWalletLog:', error);
    throw error;
  }
}
