
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

    // Tạo ví nếu chưa có
    const { data: wallet, error: walletError } = await supabase
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

      console.log('✅ New wallet created:', newWallet.id);
      
      // Tạo wallet log
      await createWalletLog(supabase, newWallet.id, order.id, piAmount, transactionAmount);
    } else {
      console.log('📈 Updating existing wallet');
      
      // Cập nhật ví hiện tại
      const { error: updateError } = await supabase
        .from('wallets')
        .update({
          pending: wallet.pending + piAmount,
          total_earned: wallet.total_earned + piAmount
        })
        .eq('id', wallet.id);

      if (updateError) {
        console.error('❌ Error updating wallet:', updateError);
        return;
      }

      console.log('✅ Wallet updated successfully');
      
      // Tạo wallet log
      await createWalletLog(supabase, wallet.id, order.id, piAmount, transactionAmount);
    }

  } catch (error) {
    console.error('❌ Error in processSellerEarning:', error);
  }
}

async function createWalletLog(supabase: any, walletId: string, orderId: string, piAmount: number, vndAmount: number) {
  try {
    // Tính release date (3 ngày sau)
    const releaseDate = new Date();
    releaseDate.setDate(releaseDate.getDate() + 3);

    const { error } = await supabase
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
      });

    if (error) {
      console.error('❌ Error creating wallet log:', error);
    } else {
      console.log(`✅ Wallet log created - Release date: ${releaseDate.toISOString()}`);
    }
  } catch (error) {
    console.error('❌ Error in createWalletLog:', error);
  }
}
