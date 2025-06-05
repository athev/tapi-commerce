
export async function getOrCreateWallet(sellerId: string, supabase: any) {
  console.log(`🔍 [WALLET OPS] Finding wallet for seller: ${sellerId}`);
  
  let { data: wallet, error: walletError } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', sellerId)
    .maybeSingle();

  if (walletError) {
    console.error('❌ [WALLET OPS] Error fetching wallet:', walletError);
    throw new Error(`Error fetching wallet: ${walletError.message}`);
  }

  if (!wallet) {
    console.log('🆕 [WALLET OPS] No wallet found, creating new wallet for seller');
    const { data: newWallet, error: createError } = await supabase
      .from('wallets')
      .insert({
        user_id: sellerId,
        pending: 0,
        available: 0,
        total_earned: 0
      })
      .select()
      .single();

    if (createError) {
      console.error('❌ [WALLET OPS] Error creating wallet:', createError);
      throw new Error(`Error creating wallet: ${createError.message}`);
    }

    console.log('✅ [WALLET OPS] New wallet created successfully:', newWallet);
    wallet = newWallet;
  } else {
    console.log('📈 [WALLET OPS] Found existing wallet:', {
      id: wallet.id,
      pending: wallet.pending,
      available: wallet.available,
      total_earned: wallet.total_earned
    });
  }

  return wallet;
}

export async function updateWalletEarnings(walletId: string, piAmount: number, wallet: any, supabase: any) {
  const newPending = Number(wallet.pending) + piAmount;
  const newTotalEarned = Number(wallet.total_earned) + piAmount;
  
  console.log(`💵 [WALLET OPS] Wallet update calculation:`);
  console.log(`  - Current pending: ${wallet.pending} → New pending: ${newPending}`);
  console.log(`  - Current total_earned: ${wallet.total_earned} → New total_earned: ${newTotalEarned}`);
  
  const { data: updatedWallet, error: updateError } = await supabase
    .from('wallets')
    .update({
      pending: newPending,
      total_earned: newTotalEarned,
      updated_at: new Date().toISOString()
    })
    .eq('id', walletId)
    .select()
    .single();

  if (updateError) {
    console.error('❌ [WALLET OPS] Error updating wallet:', updateError);
    throw new Error(`Error updating wallet: ${updateError.message}`);
  }

  console.log('✅ [WALLET OPS] Wallet updated successfully:', updatedWallet);
  return updatedWallet;
}
