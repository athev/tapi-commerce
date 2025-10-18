
export async function checkExistingWalletLog(orderId: string, supabase: any) {
  console.log(`🔍 [WALLET LOG] Checking for existing wallet log for order: ${orderId}`);
  
  const { data, error } = await supabase
    .from('wallet_logs')
    .select('*')
    .eq('order_id', orderId)
    .eq('type', 'earning')
    .maybeSingle();

  if (error) {
    console.error('❌ [WALLET LOG] Error checking existing log:', error);
    return null;
  }

  if (data) {
    console.log(`⚠️ [WALLET LOG] Found existing log: ${data.id}`);
  } else {
    console.log(`✅ [WALLET LOG] No existing log found`);
  }

  return data;
}

export async function createWalletLog(
  walletId: string,
  orderId: string,
  piAmount: number,
  vndAmount: number,
  supabase: any
) {
  console.log(`📝 [WALLET LOG] Creating wallet log:`, {
    wallet_id: walletId,
    order_id: orderId,
    pi_amount: piAmount,
    vnd_amount: vndAmount
  });

  // Calculate release date (3 days from now)
  const releaseDate = new Date();
  releaseDate.setDate(releaseDate.getDate() + 3);

  const { data: walletLog, error: logError } = await supabase
    .from('wallet_logs')
    .insert({
      wallet_id: walletId,
      order_id: orderId,
      type: 'earning',
      status: 'pending',
      pi_amount: piAmount,
      vnd_amount: vndAmount,
      release_date: releaseDate.toISOString(),
      description: `Earning from order ${orderId.substring(0, 8)}`
    })
    .select()
    .single();

  if (logError) {
    console.error('❌ [WALLET LOG] Error creating wallet log:', logError);
    return { success: false, error: `Failed to create wallet log: ${logError.message}` };
  }

  console.log(`✅ [WALLET LOG] Created wallet log: ${walletLog.id}`, {
    release_date: releaseDate.toISOString(),
    status: 'pending'
  });

  return { 
    success: true, 
    wallet_log_id: walletLog.id,
    release_date: releaseDate
  };
}
