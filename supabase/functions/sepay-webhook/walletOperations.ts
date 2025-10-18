
export async function getOrCreateWallet(sellerId: string, supabase: any) {
  console.log(`💼 [WALLET OPS] Getting or creating wallet for seller: ${sellerId}`);
  
  try {
    // First, try to get existing wallet
    const { data: existingWallet, error: fetchError } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', sellerId)
      .maybeSingle();

    if (fetchError) {
      console.error('❌ [WALLET OPS] Error fetching wallet:', fetchError);
      return { error: `Failed to fetch wallet: ${fetchError.message}` };
    }

    if (existingWallet) {
      console.log(`✅ [WALLET OPS] Found existing wallet: ${existingWallet.id}`);
      return { wallet: existingWallet, walletId: existingWallet.id };
    }

    // Create new wallet if doesn't exist
    console.log(`🆕 [WALLET OPS] Creating new wallet for seller: ${sellerId}`);
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
      return { error: `Failed to create wallet: ${createError.message}` };
    }

    console.log(`✅ [WALLET OPS] Created new wallet: ${newWallet.id}`);
    return { wallet: newWallet, walletId: newWallet.id };

  } catch (error) {
    console.error('❌ [WALLET OPS] Unexpected error:', error);
    return { error: `Unexpected error: ${error.message}` };
  }
}

export async function updateWalletEarnings(walletId: string, piAmount: number, wallet: any, supabase: any) {
  console.log(`💰 [WALLET OPS] Updating wallet earnings:`, {
    wallet_id: walletId,
    pi_to_add: piAmount,
    current_pending: wallet.pending,
    current_total_earned: wallet.total_earned
  });

  const newPending = Number(wallet.pending) + piAmount;
  const newTotalEarned = Number(wallet.total_earned) + piAmount;

  const { error: updateError } = await supabase
    .from('wallets')
    .update({
      pending: newPending,
      total_earned: newTotalEarned,
      updated_at: new Date().toISOString()
    })
    .eq('id', walletId);

  if (updateError) {
    console.error('❌ [WALLET OPS] Error updating wallet:', updateError);
    return { success: false, error: `Failed to update wallet: ${updateError.message}` };
  }

  console.log(`✅ [WALLET OPS] Wallet updated successfully:`, {
    new_pending: newPending,
    new_total_earned: newTotalEarned
  });

  return { 
    success: true, 
    new_pending: newPending, 
    new_total_earned: newTotalEarned 
  };
}
