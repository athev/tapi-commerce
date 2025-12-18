import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const ZALO_BOT_API_KEY = Deno.env.get("ZALO_BOT_API_KEY");
const ZALO_API_URL = "https://bot.zapps.me/api/v1/message/send";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    console.log("[zalo-bot-webhook] Received payload:", JSON.stringify(payload));

    // Extract user_id and message from the webhook payload
    // bot.zapps.me typically sends: { user_id, message, ... }
    const { user_id, message, sender, event_name, data } = payload;
    
    // Handle different payload formats from bot.zapps.me
    const zaloUserId = user_id || sender?.id || data?.user_id || data?.sender?.id;
    const userMessage = message || data?.message || data?.content || '';
    
    console.log(`[zalo-bot-webhook] User ID: ${zaloUserId}, Message: ${userMessage}`);

    if (!zaloUserId) {
      console.log("[zalo-bot-webhook] No user_id found in payload");
      return new Response(
        JSON.stringify({ success: false, error: "No user_id in payload" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    if (!ZALO_BOT_API_KEY) {
      console.error("[zalo-bot-webhook] ZALO_BOT_API_KEY not configured");
      return new Response(
        JSON.stringify({ success: false, error: "Bot API key not configured" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Create response message with user's Zalo ID
    const responseMessage = `🎉 Chào mừng bạn đến với TAPI Bot!

━━━━━━━━━━━━━━━
📱 Zalo User ID của bạn:
${zaloUserId}
━━━━━━━━━━━━━━━

📋 Hướng dẫn liên kết:
1️⃣ Copy ID phía trên
2️⃣ Mở app/web TAPI
3️⃣ Vào Tôi → Thông báo Zalo
4️⃣ Dán ID và nhấn "Liên kết"

✅ Sau khi liên kết, bạn sẽ nhận được thông báo:
• 🛒 Đơn hàng mới
• 💰 Thanh toán thành công
• 📦 Cập nhật giao hàng
• 💬 Tin nhắn từ shop
• ⭐ Đánh giá & phản hồi

━━━━━━━━━━━━━━━
🏪 TAPI - Chợ sản phẩm số
🌐 https://sanphamso.store`;

    // Send response back to user via bot.zapps.me
    console.log(`[zalo-bot-webhook] Sending response to user ${zaloUserId}`);
    
    const response = await fetch(ZALO_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${ZALO_BOT_API_KEY}`
      },
      body: JSON.stringify({
        user_id: zaloUserId,
        message: responseMessage
      })
    });

    const responseText = await response.text();
    console.log(`[zalo-bot-webhook] API Response (${response.status}):`, responseText);

    let result;
    try {
      result = JSON.parse(responseText);
    } catch {
      result = { raw: responseText };
    }

    if (!response.ok) {
      console.error(`[zalo-bot-webhook] API error: ${response.status}`, result);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to send response", details: result }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    console.log(`[zalo-bot-webhook] Successfully sent Zalo ID to user ${zaloUserId}`);

    return new Response(
      JSON.stringify({ success: true, user_id: zaloUserId }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("[zalo-bot-webhook] Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
