
export async function processSellerEarning(order: any, bankAmount: number, supabase: any) {
  try {
    console.log(`🚀 [WALLET] === PROCESSING SELLER EARNING START ===`);
    console.log(`🚀 [WALLET] Order ID: ${order.id}`);
    console.log(`🚀 [WALLET] Bank Amount: ${bankAmount} VNĐ`);
    
    const sellerId = order.products?.seller_id;
    if (!sellerId) {
      console.error('❌ [WALLET] No seller ID found in order.products.seller_id');
      console.log('❌ [WALLET] Order structure:', JSON.stringify(order, null, 2));
      return { success: false, error: 'No seller ID found' };
    }

    console.log(`💰 [WALLET] Seller ID: ${sellerId}`);

    // Kiểm tra điều kiện cơ bản
    if (order.status !== 'paid') {
      console.log('⚠️ [WALLET] Order is not paid, current status:', order.status);
      return { success: false, error: 'Order is not paid' };
    }

    if (!bankAmount || bankAmount <= 0) {
      console.error('❌ [WALLET] Invalid bank amount:', bankAmount);
      return { success: false, error: 'Invalid bank amount' };
    }

    // Tính PI amount (1 PI = 1000 VNĐ)
    const piAmount = Math.floor(bankAmount / 1000);
    console.log(`💰 [WALLET] PI Amount calculated: ${piAmount} PI from ${bankAmount} VNĐ (rate: 1 PI = 1000 VNĐ)`);

    if (piAmount <= 0) {
      console.error('❌ [WALLET] PI amount is zero or negative after calculation:', piAmount);
      return { success: false, error: 'PI amount is zero or negative' };
    }

    // 🔍 BƯỚC 1: Kiểm tra trùng lặp TRƯỚC KHI xử lý
    console.log(`🔍 [WALLET] Checking for existing wallet log for order: ${order.id}`);
    const { data: existingLog, error: logCheckError } = await supabase
      .from('wallet_logs')
      .select('*')
      .eq('order_id', order.id)
      .eq('type', 'earning')
      .maybeSingle();

    if (logCheckError) {
      console.error('❌ [WALLET] Error checking existing wallet log:', logCheckError);
      return { success: false, error: 'Error checking existing wallet log' };
    }

    if (existingLog) {
      console.log('✅ [WALLET] Wallet log already exists for this order, skipping duplicate processing');
      console.log('📋 [WALLET] Existing log details:', existingLog);
      return { success: true, message: 'Already processed', logId: existingLog.id };
    }

    console.log('✅ [WALLET] No existing log found, proceeding with wallet processing...');

    // 💰 BƯỚC 2: Lấy hoặc tạo ví cho seller
    console.log(`🔍 [WALLET] Finding wallet for seller: ${sellerId}`);
    let { data: wallet, error: walletError } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', sellerId)
      .maybeSingle();

    if (walletError) {
      console.error('❌ [WALLET] Error fetching wallet:', walletError);
      return { success: false, error: 'Error fetching wallet' };
    }

    if (!wallet) {
      console.log('🆕 [WALLET] No wallet found, creating new wallet for seller');
      const { data: newWallet, error: createError } = await supabase
        .from('wallets')
        .insert({
          user_id: sellerId,
          pending: piAmount,
          available: 0,
          total_earned: piAmount
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ [WALLET] Error creating wallet:', createError);
        return { success: false, error: 'Error creating wallet' };
      }

      console.log('✅ [WALLET] New wallet created successfully:', newWallet);
      wallet = newWallet;
    } else {
      console.log('📈 [WALLET] Found existing wallet, updating with PI');
      console.log('💵 [WALLET] Current wallet state:', {
        id: wallet.id,
        pending: wallet.pending,
        available: wallet.available,
        total_earned: wallet.total_earned
      });
      
      // Tính toán giá trị mới
      const newPending = Number(wallet.pending) + piAmount;
      const newTotalEarned = Number(wallet.total_earned) + piAmount;
      
      console.log(`💵 [WALLET] Wallet update calculation:`);
      console.log(`  - Current pending: ${wallet.pending} → New pending: ${newPending}`);
      console.log(`  - Current total_earned: ${wallet.total_earned} → New total_earned: ${newTotalEarned}`);
      
      const { data: updatedWallet, error: updateError } = await supabase
        .from('wallets')
        .update({
          pending: newPending,
          total_earned: newTotalEarned,
          updated_at: new Date().toISOString()
        })
        .eq('id', wallet.id)
        .select()
        .single();

      if (updateError) {
        console.error('❌ [WALLET] Error updating wallet:', updateError);
        return { success: false, error: 'Error updating wallet' };
      }

      console.log('✅ [WALLET] Wallet updated successfully:', updatedWallet);
      wallet = updatedWallet;
    }

    // 📝 BƯỚC 3: Tạo wallet log
    console.log(`📝 [WALLET] Creating wallet log for order: ${order.id}`);
    const logResult = await createWalletLog(supabase, wallet.id, order.id, piAmount, bankAmount, sellerId);
    
    if (!logResult.success) {
      console.error('❌ [WALLET] Failed to create wallet log:', logResult.error);
      return { success: false, error: 'Failed to create wallet log' };
    }

    // 🎉 THÀNH CÔNG!
    console.log(`🎉 🎉 🎉 [WALLET] === SELLER EARNING PROCESSING COMPLETED SUCCESSFULLY ===`);
    console.log(`💎 [WALLET] Summary:`);
    console.log(`  - Seller ID: ${sellerId}`);
    console.log(`  - Order ID: ${order.id}`);
    console.log(`  - VND Amount: ${bankAmount}`);
    console.log(`  - PI Added: ${piAmount}`);
    console.log(`  - Wallet ID: ${wallet.id}`);
    console.log(`  - New Pending: ${wallet.pending}`);
    console.log(`  - New Total Earned: ${wallet.total_earned}`);
    console.log(`  - Log ID: ${logResult.logId}`);
    console.log(`🎉 🎉 🎉 === END PROCESSING ===`);

    return { 
      success: true, 
      piAmount, 
      walletId: wallet.id,
      logId: logResult.logId,
      message: `Successfully added ${piAmount} PI to seller wallet from order ${order.id}`
    };

  } catch (error) {
    console.error('💥 [WALLET] CRITICAL ERROR in processSellerEarning:', error);
    console.error('💥 [WALLET] Error stack:', error.stack);
    return { success: false, error: error.message || 'Unknown error' };
  }
}

async function createWalletLog(supabase: any, walletId: string, orderId: string, piAmount: number, vndAmount: number, sellerId: string) {
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
      return { success: false, error: error.message };
    } else {
      console.log(`✅ [WALLET LOG] Wallet log created successfully:`, {
        logId: logResult.id,
        sellerId: sellerId,
        orderId: orderId,
        piAmount: piAmount,
        vndAmount: vndAmount,
        releaseDate: releaseDate.toISOString()
      });
      return { success: true, logId: logResult.id };
    }
  } catch (error) {
    console.error('💥 [WALLET LOG] Error in createWalletLog:', error);
    return { success: false, error: error.message || 'Unknown error' };
  }
}
