import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ZALO_APP_SECRET = Deno.env.get("ZALO_APP_SECRET");
const ZALO_APP_ID = Deno.env.get("ZALO_APP_ID");

// Fallback to bot.zapps.me if OA not configured
const ZALO_BOT_API_KEY = Deno.env.get("ZALO_BOT_API_KEY");
const ZALO_BOT_API_URL = "https://bot.zapps.me/api/v1/message/send";

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

// Helper to get valid OA access token
async function getValidOAAccessToken(supabase: any): Promise<{ accessToken: string; oaId: string } | null> {
  // Get the first (or default) OA token
  const { data: tokenData, error } = await supabase
    .from('zalo_oa_tokens')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !tokenData) {
    console.log("[send-zalo] No OA token found in database");
    return null;
  }

  const now = new Date();
  const expiresAt = new Date(tokenData.expires_at);

  // If token is still valid (with 5 min buffer), return it
  if (expiresAt.getTime() - now.getTime() > 5 * 60 * 1000) {
    return { accessToken: tokenData.access_token, oaId: tokenData.oa_id };
  }

  // Token expired, refresh it
  console.log("[send-zalo] OA token expired, refreshing...");
  
  const refreshResponse = await fetch("https://oauth.zaloapp.com/v4/oa/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "secret_key": ZALO_APP_SECRET!
    },
    body: new URLSearchParams({
      refresh_token: tokenData.refresh_token,
      app_id: ZALO_APP_ID!,
      grant_type: "refresh_token"
    })
  });

  const refreshData = await refreshResponse.json();
  
  if (refreshData.error) {
    console.error("[send-zalo] Token refresh failed:", refreshData);
    return null;
  }

  // Update token in database
  const newExpiresAt = new Date(Date.now() + (refreshData.expires_in || 86400) * 1000);
  
  await supabase
    .from('zalo_oa_tokens')
    .update({
      access_token: refreshData.access_token,
      refresh_token: refreshData.refresh_token,
      expires_at: newExpiresAt.toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('oa_id', tokenData.oa_id);

  console.log("[send-zalo] OA token refreshed successfully");
  return { accessToken: refreshData.access_token, oaId: tokenData.oa_id };
}

// Send via Zalo OA API
async function sendViaZaloOA(accessToken: string, userId: string, message: string): Promise<any> {
  const response = await fetch("https://openapi.zalo.me/v3.0/oa/message/cs", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "access_token": accessToken
    },
    body: JSON.stringify({
      recipient: { user_id: userId },
      message: { text: message }
    })
  });
  return response.json();
}

// Send via bot.zapps.me (fallback)
async function sendViaBotZapps(userId: string, message: string): Promise<any> {
  if (!ZALO_BOT_API_KEY) {
    throw new Error("ZALO_BOT_API_KEY not configured");
  }
  
  const response = await fetch(ZALO_BOT_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${ZALO_BOT_API_KEY}`
    },
    body: JSON.stringify({
      user_id: userId,
      message: message
    })
  });
  return response.json();
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, title, message, action_url, type, notification_id } = await req.json();
    
    console.log(`[send-zalo] Processing notification ${notification_id} for user ${user_id}`);

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
    
    // Try Zalo OA first, fallback to bot.zapps.me
    let result;
    let sendMethod = "unknown";
    
    const oaToken = await getValidOAAccessToken(supabase);
    
    if (oaToken) {
      // Use Zalo OA API
      console.log(`[send-zalo] Using Zalo OA API (OA: ${oaToken.oaId})`);
      sendMethod = "zalo_oa";
      result = await sendViaZaloOA(oaToken.accessToken, profile.zalo_user_id, formattedMessage);
    } else if (ZALO_BOT_API_KEY) {
      // Fallback to bot.zapps.me
      console.log(`[send-zalo] Using bot.zapps.me fallback`);
      sendMethod = "bot_zapps";
      result = await sendViaBotZapps(profile.zalo_user_id, formattedMessage);
    } else {
      console.error("[send-zalo] No Zalo sending method configured");
      return new Response(
        JSON.stringify({ success: false, error: "No Zalo API configured" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    console.log(`[send-zalo] API Response (${sendMethod}):`, JSON.stringify(result));

    // Check for errors in response
    if (result.error) {
      console.error(`[send-zalo] API error:`, result);
      return new Response(
        JSON.stringify({ success: false, error: "Zalo API error", details: result }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    console.log(`[send-zalo] Successfully sent notification ${notification_id} via ${sendMethod}`);
    
    return new Response(
      JSON.stringify({ success: true, method: sendMethod, data: result }),
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
