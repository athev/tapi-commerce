
export async function processSellerEarning(order: any, bankAmount: number, supabase: any) {
  try {
    console.log(`💰 [WALLET] Processing seller earning for order: ${order.id}`);
    console.log(`💰 [WALLET] Bank amount: ${bankAmount} VNĐ`);
    
    const sellerId = order.products?.seller_id;
    if (!sellerId) {
      console.error('❌ [WALLET] No seller ID found for order');
      return { success: false, error: 'No seller ID found' };
    }

    console.log(`💰 [WALLET] Seller ID: ${sellerId}`);

    // Kiểm tra điều kiện cộng PI
    if (order.status !== 'paid') {
      console.log('⚠️ [WALLET] Order is not paid, skipping PI processing');
      return { success: false, error: 'Order is not paid' };
    }

    if (!bankAmount || bankAmount <= 0) {
      console.error('❌ [WALLET] Invalid bank amount:', bankAmount);
      return { success: false, error: 'Invalid bank amount' };
    }

    // Tính PI amount (1 PI = 1000 VNĐ)
    const piAmount = Math.floor(bankAmount / 1000);
    console.log(`💰 [WALLET] PI Amount calculated: ${piAmount} PI from ${bankAmount} VNĐ`);

    if (piAmount <= 0) {
      console.error('❌ [WALLET] PI amount is zero or negative:', piAmount);
      return { success: false, error: 'PI amount is zero or negative' };
    }

    // BƯỚC 1: Kiểm tra xem đã có wallet log cho order này chưa (tránh trùng lặp)
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
      console.log('📋 [WALLET] Existing log:', existingLog);
      return { success: true, message: 'Already processed', logId: existingLog.id };
    }

    // BƯỚC 2: Lấy hoặc tạo ví cho seller
    console.log(`🔍 [WALLET] Finding or creating wallet for seller: ${sellerId}`);
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
      console.log('🆕 [WALLET] Creating new wallet for seller');
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

      console.log('✅ [WALLET] New wallet created:', newWallet);
      wallet = newWallet;
    } else {
      console.log('📈 [WALLET] Updating existing wallet with PI');
      console.log('💵 [WALLET] Current wallet state:', {
        pending: wallet.pending,
        available: wallet.available,
        total_earned: wallet.total_earned
      });
      
      // BƯỚC 3: Cập nhật ví hiện tại - cộng PI vào pending và total_earned
      const newPending = Number(wallet.pending) + piAmount;
      const newTotalEarned = Number(wallet.total_earned) + piAmount;
      
      console.log(`💵 [WALLET] Wallet update: pending ${wallet.pending} → ${newPending}, total_earned ${wallet.total_earned} → ${newTotalEarned}`);
      
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

    // BƯỚC 4: Tạo wallet log để tracking
    console.log(`📝 [WALLET] Creating wallet log for order: ${order.id}`);
    const logResult = await createWalletLog(supabase, wallet.id, order.id, piAmount, bankAmount, sellerId);
    
    if (!logResult.success) {
      console.error('❌ [WALLET] Failed to create wallet log:', logResult.error);
      return { success: false, error: 'Failed to create wallet log' };
    }

    console.log(`🎉 [WALLET] Successfully added ${piAmount} PI to seller's wallet for order ${order.id}`);
    console.log(`📊 [WALLET] Final wallet state:`, {
      sellerId: sellerId,
      orderId: order.id,
      piAdded: piAmount,
      vndAmount: bankAmount,
      walletPending: wallet.pending,
      walletAvailable: wallet.available,
      walletTotalEarned: wallet.total_earned
    });

    return { 
      success: true, 
      piAmount, 
      walletId: wallet.id,
      logId: logResult.logId,
      message: `Added ${piAmount} PI to seller wallet from order ${order.id}`
    };

  } catch (error) {
    console.error('❌ [WALLET] Error in processSellerEarning:', error);
    return { success: false, error: error.message || 'Unknown error' };
  }
}

async function createWalletLog(supabase: any, walletId: string, orderId: string, piAmount: number, vndAmount: number, sellerId: string) {
  try {
    // Tính release date (3 ngày sau)
    const releaseDate = new Date();
    releaseDate.setDate(releaseDate.getDate() + 3);

    console.log(`📝 [WALLET] Creating wallet log for seller ${sellerId}, order ${orderId}, ${piAmount} PI`);

    const { data: logResult, error } = await supabase
      .from('wallet_logs')
      .insert({
        wallet_id: walletId,
        order_id: orderId,
        type: 'earning',
        pi_amount: piAmount,
        vnd_amount: vndAmount,
        status: 'pending',
        description: `Earnings from order ${orderId.slice(0, 8)}`,
        release_date: releaseDate.toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('❌ [WALLET] Error creating wallet log:', error);
      return { success: false, error: error.message };
    } else {
      console.log(`✅ [WALLET] Wallet log created successfully:`, {
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
    console.error('❌ [WALLET] Error in createWalletLog:', error);
    return { success: false, error: error.message || 'Unknown error' };
  }
}
