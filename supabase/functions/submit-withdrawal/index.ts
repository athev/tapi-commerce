import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    const { 
      pi_amount, 
      bank_name, 
      bank_account_number, 
      bank_account_name 
    } = await req.json()

    console.log('📤 Withdrawal request from user:', user.id)

    // Validate amount
    if (!pi_amount || pi_amount < 100) {
      throw new Error('Số tiền rút tối thiểu là 100 PI')
    }

    // Get user's wallet
    const { data: wallet, error: walletError } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (walletError || !wallet) {
      throw new Error('Không tìm thấy ví của bạn')
    }

    // Check if user has enough available balance
    if (wallet.available < pi_amount) {
      throw new Error(`Số dư không đủ. Bạn chỉ có ${wallet.available} PI khả dụng`)
    }

    // Check for pending withdrawal in last 24 hours (rate limit)
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    const { data: recentWithdrawals } = await supabase
      .from('withdrawal_requests')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .gte('created_at', yesterday.toISOString())

    if (recentWithdrawals && recentWithdrawals.length > 0) {
      throw new Error('Bạn chỉ có thể tạo 1 yêu cầu rút tiền mỗi ngày. Vui lòng đợi yêu cầu trước được xử lý.')
    }

    // Calculate VND amount (1 PI = 1000 VND)
    const vnd_amount = pi_amount * 1000

    // Create withdrawal request
    const { data: withdrawal, error: withdrawalError } = await supabase
      .from('withdrawal_requests')
      .insert({
        user_id: user.id,
        wallet_id: wallet.id,
        pi_amount,
        vnd_amount,
        bank_name,
        bank_account_number,
        bank_account_name,
        status: 'pending'
      })
      .select()
      .single()

    if (withdrawalError) {
      console.error('❌ Error creating withdrawal:', withdrawalError)
      throw withdrawalError
    }

    // Lock funds: move from available to pending (temporary)
    // Note: Funds will be released if rejected, deducted if approved
    const { error: updateWalletError } = await supabase
      .from('wallets')
      .update({
        available: wallet.available - pi_amount,
        updated_at: new Date().toISOString()
      })
      .eq('id', wallet.id)

    if (updateWalletError) {
      console.error('❌ Error locking funds:', updateWalletError)
      throw updateWalletError
    }

    // Create wallet log
    await supabase
      .from('wallet_logs')
      .insert({
        wallet_id: wallet.id,
        type: 'withdrawal_request',
        pi_amount: -pi_amount,
        vnd_amount: -vnd_amount,
        status: 'pending',
        description: `Yêu cầu rút tiền về ${bank_name} - ${bank_account_number}`
      })

    // Create notification for user
    await supabase
      .from('notifications')
      .insert({
        user_id: user.id,
        type: 'info',
        title: 'Yêu cầu rút tiền đã được tạo',
        message: `Yêu cầu rút ${pi_amount} PI đã được gửi đi. Chúng tôi sẽ xử lý trong vòng 24-48 giờ.`
      })

    console.log('✅ Withdrawal request created:', withdrawal.id)

    return new Response(JSON.stringify({
      success: true,
      withdrawal
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('❌ Submit withdrawal error:', error)
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})