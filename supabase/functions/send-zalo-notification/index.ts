import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ZALO_BOT_API_KEY = Deno.env.get("ZALO_BOT_API_KEY");
const ZALO_API_URL = "https://bot.zapps.me/api/v1/message/send";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Format notification type to Vietnamese label
const getNotificationTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    'order_paid': '💰 Thanh toán',
    'order_delivered': '📦 Giao hàng',
    'order_completed': '✅ Hoàn thành',
    'new_message': '💬 Tin nhắn mới',
    'new_order': '🛒 Đơn hàng mới',
    'withdrawal_approved': '💳 Rút tiền',
    'withdrawal_rejected': '❌ Từ chối rút tiền',
    'service_quote': '📋 Báo giá dịch vụ',
    'service_completed': '✨ Dịch vụ hoàn thành',
    'warranty_claim': '🔧 Yêu cầu bảo hành',
    'warranty_response': '📩 Phản hồi bảo hành',
    'review_received': '⭐ Đánh giá mới',
    'pi_reward': '🎁 Thưởng PI',
  };
  return labels[type] || '🔔 Thông báo';
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, title, message, action_url, type, notification_id } = await req.json();
    
    console.log(`[send-zalo] Processing notification ${notification_id} for user ${user_id}`);

    if (!ZALO_BOT_API_KEY) {
      console.error("[send-zalo] ZALO_BOT_API_KEY not configured");
      return new Response(
        JSON.stringify({ success: false, error: "Zalo API key not configured" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    
    // Fetch user's zalo_user_id from profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('zalo_user_id, full_name')
      .eq('id', user_id)
      .single();
    
    if (profileError) {
      console.error("[send-zalo] Error fetching profile:", profileError);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to fetch user profile" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    if (!profile?.zalo_user_id) {
      console.log(`[send-zalo] User ${user_id} has no Zalo ID linked, skipping`);
      return new Response(
        JSON.stringify({ success: false, reason: "no_zalo_id" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Format message for Zalo
    const typeLabel = getNotificationTypeLabel(type);
    const formattedMessage = [
      `${typeLabel}`,
      `━━━━━━━━━━━━━━━`,
      `📌 ${title}`,
      ``,
      message,
      action_url ? `\n👉 Xem chi tiết: ${action_url}` : '',
      ``,
      `━━━━━━━━━━━━━━━`,
      `🏪 TAPI - Chợ sản phẩm số`
    ].filter(Boolean).join('\n');
    
    console.log(`[send-zalo] Sending to Zalo user: ${profile.zalo_user_id}`);
    
    // Send to bot.zapps.me API
    const response = await fetch(ZALO_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${ZALO_BOT_API_KEY}`
      },
      body: JSON.stringify({
        user_id: profile.zalo_user_id,
        message: formattedMessage
      })
    });
    
    const responseText = await response.text();
    console.log(`[send-zalo] API Response (${response.status}):`, responseText);
    
    let result;
    try {
      result = JSON.parse(responseText);
    } catch {
      result = { raw: responseText };
    }

    if (!response.ok) {
      console.error(`[send-zalo] API error: ${response.status}`, result);
      return new Response(
        JSON.stringify({ success: false, error: "Zalo API error", details: result }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: response.status }
      );
    }
    
    console.log(`[send-zalo] Successfully sent notification ${notification_id} to Zalo`);
    
    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("[send-zalo] Unexpected error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
