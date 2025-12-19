import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ZALO_APP_SECRET = Deno.env.get("ZALO_APP_SECRET");

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper to send message via Zalo OA API
async function sendZaloOAMessage(accessToken: string, userId: string, message: string) {
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

// Helper to get valid access token (refresh if needed)
async function getValidAccessToken(supabase: any, oaId: string): Promise<string | null> {
  const { data: tokenData, error } = await supabase
    .from('zalo_oa_tokens')
    .select('*')
    .eq('oa_id', oaId)
    .single();

  if (error || !tokenData) {
    console.log(`[zalo-oa-webhook] No token found for OA: ${oaId}`);
    return null;
  }

  const now = new Date();
  const expiresAt = new Date(tokenData.expires_at);

  // If token is still valid (with 5 min buffer), return it
  if (expiresAt.getTime() - now.getTime() > 5 * 60 * 1000) {
    return tokenData.access_token;
  }

  // Token expired, refresh it
  console.log(`[zalo-oa-webhook] Token expired, refreshing...`);
  
  const refreshResponse = await fetch("https://oauth.zaloapp.com/v4/oa/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "secret_key": ZALO_APP_SECRET!
    },
    body: new URLSearchParams({
      refresh_token: tokenData.refresh_token,
      app_id: Deno.env.get("ZALO_APP_ID")!,
      grant_type: "refresh_token"
    })
  });

  const refreshData = await refreshResponse.json();
  
  if (refreshData.error) {
    console.error(`[zalo-oa-webhook] Token refresh failed:`, refreshData);
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
    .eq('oa_id', oaId);

  console.log(`[zalo-oa-webhook] Token refreshed successfully`);
  return refreshData.access_token;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    console.log(`[zalo-oa-webhook] Received event:`, JSON.stringify(payload));

    const { event_name, sender, recipient, message, timestamp, app_id } = payload;
    
    // Create Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Handle different event types
    switch (event_name) {
      case "user_send_text": {
        // User sent a text message
        const userId = sender?.id;
        const userMessage = message?.text || "";
        const oaId = recipient?.id;
        
        console.log(`[zalo-oa-webhook] User ${userId} sent message: ${userMessage}`);

        // Get valid access token
        const accessToken = await getValidAccessToken(supabase, oaId);
        
        if (!accessToken) {
          console.log("[zalo-oa-webhook] No valid access token, cannot reply");
          break;
        }

        // Send welcome message with user's Zalo ID
        const replyMessage = `🎉 Chào mừng bạn đến với TAPI Store!

📋 Zalo User ID của bạn:
${userId}

📌 Hướng dẫn liên kết tài khoản:
1. Đăng nhập vào TAPI
2. Vào trang Hồ sơ cá nhân
3. Tìm phần "Liên kết Zalo"
4. Dán Zalo User ID ở trên vào

✅ Sau khi liên kết, bạn sẽ nhận được thông báo về:
• Đơn hàng mới (cho Seller)
• Trạng thái đơn hàng
• Tin nhắn từ khách hàng
• Các thông báo quan trọng khác

🏪 TAPI - Chợ sản phẩm số`;

        const sendResult = await sendZaloOAMessage(accessToken, userId, replyMessage);
        console.log(`[zalo-oa-webhook] Send message result:`, JSON.stringify(sendResult));
        break;
      }

      case "follow": {
        // User followed the OA
        const userId = payload.follower?.id || sender?.id;
        const oaId = payload.oa_id || recipient?.id;
        
        console.log(`[zalo-oa-webhook] User ${userId} followed OA ${oaId}`);

        const accessToken = await getValidAccessToken(supabase, oaId);
        
        if (!accessToken) {
          console.log("[zalo-oa-webhook] No valid access token, cannot reply");
          break;
        }

        // Send welcome message
        const welcomeMessage = `🎉 Cảm ơn bạn đã quan tâm TAPI Store!

📋 Zalo User ID của bạn:
${userId}

📌 Để nhận thông báo đơn hàng qua Zalo:
1. Đăng nhập vào TAPI
2. Vào Hồ sơ → Liên kết Zalo
3. Dán ID ở trên và nhấn Liên kết

🛍️ Chúc bạn mua sắm vui vẻ!`;

        const sendResult = await sendZaloOAMessage(accessToken, userId, welcomeMessage);
        console.log(`[zalo-oa-webhook] Send welcome result:`, JSON.stringify(sendResult));
        break;
      }

      case "unfollow": {
        // User unfollowed - we can clear their zalo_user_id from profile
        const userId = payload.follower?.id || sender?.id;
        console.log(`[zalo-oa-webhook] User ${userId} unfollowed OA`);
        
        // Optionally clear zalo_user_id from profiles
        await supabase
          .from('profiles')
          .update({ zalo_user_id: null })
          .eq('zalo_user_id', userId);
        break;
      }

      default:
        console.log(`[zalo-oa-webhook] Unhandled event: ${event_name}`);
    }

    // Always return 200 to acknowledge webhook
    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("[zalo-oa-webhook] Error:", error);
    // Still return 200 to avoid Zalo retrying
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
