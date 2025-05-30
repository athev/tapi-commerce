
export async function processSellerEarning(order: any, transactionAmount: number, supabase: any) {
  try {
    console.log(`💰 Processing seller earning for order: ${order.id}`);
    
    const sellerId = order.products?.seller_id;
    if (!sellerId) {
      console.error('❌ No seller ID found for order');
      return;
    }

    // Tính PI amount (1 PI = 1000 VND)
    const piAmount = Math.floor(transactionAmount / 1000);
    console.log(`📊 PI Amount calculated: ${piAmount} PI (${transactionAmount} VND)`);

    // BƯỚC 1: Kiểm tra xem đã có wallet log cho order này chưa (tránh trùng lặp)
    const { data: existingLog, error: logCheckError } = await supabase
      .from('wallet_logs')
      .select('*')
      .eq('order_id', order.id)
      .eq('type', 'earning')
      .maybeSingle();

    if (logCheckError) {
      console.error('❌ Error checking existing wallet log:', logCheckError);
      return;
    }

    if (existingLog) {
      console.log('✅ Wallet log already exists for this order, skipping duplicate processing');
      return;
    }

    // BƯỚC 2: Lấy hoặc tạo ví cho seller
    let { data: wallet, error: walletError } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', sellerId)
      .maybeSingle();

    if (walletError) {
      console.error('❌ Error fetching wallet:', walletError);
      return;
    }

    if (!wallet) {
      console.log('🆕 Creating new wallet for seller');
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
        console.error('❌ Error creating wallet:', createError);
        return;
      }

      console.log('✅ New wallet created with initial PI:', newWallet.id);
      wallet = newWallet;
    } else {
      console.log('📈 Updating existing wallet with PI');
      
      // BƯỚC 3: Cập nhật ví hiện tại - cộng PI vào pending và total_earned
      const newPending = Number(wallet.pending) + piAmount;
      const newTotalEarned = Number(wallet.total_earned) + piAmount;
      
      console.log(`💵 Wallet update: pending ${wallet.pending} → ${newPending}, total_earned ${wallet.total_earned} → ${newTotalEarned}`);
      
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
        console.error('❌ Error updating wallet:', updateError);
        return;
      }

      console.log('✅ Wallet updated successfully with PI added to pending');
      wallet = updatedWallet;
    }

    // BƯỚC 4: Tạo wallet log để tracking
    await createWalletLog(supabase, wallet.id, order.id, piAmount, transactionAmount);

    console.log(`🎉 Successfully added ${piAmount} PI to seller's wallet for order ${order.id}`);
    console.log(`📊 Final wallet state - pending: ${wallet.pending}, available: ${wallet.available}, total_earned: ${wallet.total_earned}`);

  } catch (error) {
    console.error('❌ Error in processSellerEarning:', error);
    throw error; // Re-throw để có thể catch ở level cao hơn
  }
}

async function createWalletLog(supabase: any, walletId: string, orderId: string, piAmount: number, vndAmount: number) {
  try {
    // Tính release date (3 ngày sau)
    const releaseDate = new Date();
    releaseDate.setDate(releaseDate.getDate() + 3);

    console.log(`📝 Creating wallet log for ${piAmount} PI, release date: ${releaseDate.toISOString()}`);

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
      console.error('❌ Error creating wallet log:', error);
      throw error;
    } else {
      console.log(`✅ Wallet log created successfully - ID: ${logResult.id}`);
      console.log(`📝 Log details: ${piAmount} PI from order ${orderId}, release on ${releaseDate.toISOString()}`);
    }
  } catch (error) {
    console.error('❌ Error in createWalletLog:', error);
    throw error;
  }
}
