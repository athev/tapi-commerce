import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function generateVoucherCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'PI';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { pi_amount, vnd_value } = await req.json();
    console.log('🎁 Redeem PI request:', { pi_amount, vnd_value, user_id: user.id });

    // Validate input
    const validTiers = [
      { pi: 10, vnd: 10000 },
      { pi: 50, vnd: 55000 },
      { pi: 100, vnd: 120000 }
    ];

    const tier = validTiers.find(t => t.pi === pi_amount && t.vnd === vnd_value);
    if (!tier) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid redemption tier' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get wallet
    const { data: wallet, error: walletError } = await supabase
      .from('buyer_wallets')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (walletError || !wallet) {
      console.error('Wallet not found:', walletError);
      return new Response(JSON.stringify({ success: false, error: 'Wallet not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check balance
    if (wallet.pi_balance < pi_amount) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: `Insufficient PI balance. You have ${wallet.pi_balance} PI but need ${pi_amount} PI` 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Generate unique voucher code
    let voucherCode = generateVoucherCode();
    let attempts = 0;
    while (attempts < 10) {
      const { data: existing } = await supabase
        .from('vouchers')
        .select('id')
        .eq('code', voucherCode)
        .single();
      
      if (!existing) break;
      voucherCode = generateVoucherCode();
      attempts++;
    }

    // Create voucher
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 30); // Valid for 30 days

    const { data: voucher, error: voucherError } = await supabase
      .from('vouchers')
      .insert({
        code: voucherCode,
        discount_type: 'fixed',
        discount_value: vnd_value,
        min_purchase_amount: 0,
        valid_from: new Date().toISOString(),
        valid_until: validUntil.toISOString(),
        usage_limit: 1,
        used_count: 0,
        is_active: true,
        created_by: user.id,
        applicable_to: 'all'
      })
      .select()
      .single();

    if (voucherError) {
      console.error('Error creating voucher:', voucherError);
      return new Response(JSON.stringify({ success: false, error: 'Failed to create voucher' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('✅ Voucher created:', voucher.code);

    // Deduct PI from wallet
    const { error: updateError } = await supabase
      .from('buyer_wallets')
      .update({
        pi_balance: wallet.pi_balance - pi_amount,
        updated_at: new Date().toISOString()
      })
      .eq('id', wallet.id);

    if (updateError) {
      console.error('Error updating wallet:', updateError);
      // Rollback voucher
      await supabase.from('vouchers').delete().eq('id', voucher.id);
      return new Response(JSON.stringify({ success: false, error: 'Failed to update wallet' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Create PI log
    await supabase
      .from('buyer_pi_logs')
      .insert({
        buyer_wallet_id: wallet.id,
        voucher_id: voucher.id,
        pi_amount: -pi_amount,
        type: 'voucher_redemption',
        description: `Đổi voucher ${vnd_value.toLocaleString('vi-VN')}đ`
      });

    console.log('💰 PI deducted:', pi_amount, 'New balance:', wallet.pi_balance - pi_amount);

    return new Response(JSON.stringify({
      success: true,
      voucher_code: voucherCode,
      voucher_value: vnd_value,
      new_balance: wallet.pi_balance - pi_amount,
      valid_until: validUntil.toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in redeem-pi-voucher:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
