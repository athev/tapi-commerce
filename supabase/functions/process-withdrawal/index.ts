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

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      throw new Error('Unauthorized: Admin only')
    }

    const { withdrawal_id, action, rejection_reason } = await req.json()

    if (!['approve', 'reject', 'complete'].includes(action)) {
      throw new Error('Invalid action')
    }

    console.log(`🔄 Processing withdrawal ${withdrawal_id} - Action: ${action}`)

    // Get withdrawal request
    const { data: withdrawal, error: fetchError } = await supabase
      .from('withdrawal_requests')
      .select('*, wallets!inner(*)')
      .eq('id', withdrawal_id)
      .single()

    if (fetchError || !withdrawal) {
      throw new Error('Withdrawal request not found')
    }

    if (withdrawal.status !== 'pending') {
      throw new Error('Withdrawal request already processed')
    }

    if (action === 'reject') {
      // Reject: Return funds to available balance
      await supabase
        .from('wallets')
        .update({
          available: withdrawal.wallets.available + withdrawal.pi_amount,
          updated_at: new Date().toISOString()
        })
        .eq('id', withdrawal.wallet_id)

      // Update withdrawal status
      await supabase
        .from('withdrawal_requests')
        .update({
          status: 'rejected',
          rejection_reason: rejection_reason || 'Yêu cầu bị từ chối bởi admin',
          processed_by: user.id,
          processed_at: new Date().toISOString()
        })
        .eq('id', withdrawal_id)

      // Update wallet log
      await supabase
        .from('wallet_logs')
        .insert({
          wallet_id: withdrawal.wallet_id,
          type: 'withdrawal_rejected',
          pi_amount: withdrawal.pi_amount,
          vnd_amount: withdrawal.vnd_amount,
          status: 'released',
          description: `Yêu cầu rút tiền bị từ chối: ${rejection_reason || 'Không rõ lý do'}`
        })

      // Notify user
      await supabase
        .from('notifications')
        .insert({
          user_id: withdrawal.user_id,
          type: 'warning',
          title: 'Yêu cầu rút tiền bị từ chối',
          message: `Yêu cầu rút ${withdrawal.pi_amount} PI đã bị từ chối. Lý do: ${rejection_reason || 'Không rõ'}`
        })

      console.log('✅ Withdrawal rejected, funds returned')
    } else if (action === 'approve') {
      // Approve: Deduct from total_earned, keep available unchanged
      await supabase
        .from('wallets')
        .update({
          total_earned: Math.max(0, withdrawal.wallets.total_earned - withdrawal.pi_amount),
          updated_at: new Date().toISOString()
        })
        .eq('id', withdrawal.wallet_id)

      // Update withdrawal status to approved (admin will transfer manually)
      await supabase
        .from('withdrawal_requests')
        .update({
          status: 'approved',
          processed_by: user.id,
          processed_at: new Date().toISOString()
        })
        .eq('id', withdrawal_id)

      // Update wallet log
      await supabase
        .from('wallet_logs')
        .insert({
          wallet_id: withdrawal.wallet_id,
          type: 'withdrawal_approved',
          pi_amount: -withdrawal.pi_amount,
          vnd_amount: -withdrawal.vnd_amount,
          status: 'released',
          description: `Yêu cầu rút tiền đã được duyệt - Chờ chuyển khoản`
        })

      // Notify user
      await supabase
        .from('notifications')
        .insert({
          user_id: withdrawal.user_id,
          type: 'success',
          title: 'Yêu cầu rút tiền đã được duyệt',
          message: `Yêu cầu rút ${withdrawal.pi_amount} PI (${withdrawal.vnd_amount.toLocaleString('vi-VN')} VND) đã được duyệt. Chúng tôi sẽ chuyển khoản trong 24h.`
        })

      console.log('✅ Withdrawal approved')
    } else if (action === 'complete') {
      // Mark as completed (after manual transfer)
      await supabase
        .from('withdrawal_requests')
        .update({
          status: 'completed',
          processed_by: user.id,
          processed_at: new Date().toISOString()
        })
        .eq('id', withdrawal_id)

      // Update wallet log
      await supabase
        .from('wallet_logs')
        .insert({
          wallet_id: withdrawal.wallet_id,
          type: 'withdrawal_completed',
          pi_amount: -withdrawal.pi_amount,
          vnd_amount: -withdrawal.vnd_amount,
          status: 'released',
          description: `Rút tiền hoàn tất - ${withdrawal.vnd_amount.toLocaleString('vi-VN')} VND`
        })

      // Notify user
      await supabase
        .from('notifications')
        .insert({
          user_id: withdrawal.user_id,
          type: 'success',
          title: 'Rút tiền thành công',
          message: `Đã chuyển ${withdrawal.vnd_amount.toLocaleString('vi-VN')} VND vào tài khoản ${withdrawal.bank_name} - ${withdrawal.bank_account_number}`
        })

      console.log('✅ Withdrawal completed')
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Withdrawal ${action}d successfully`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('❌ Process withdrawal error:', error)
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
