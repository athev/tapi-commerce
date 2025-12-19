import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ZALO_APP_ID = Deno.env.get("ZALO_APP_ID");
const ZALO_APP_SECRET = Deno.env.get("ZALO_APP_SECRET");

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
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const oaId = url.searchParams.get("oa_id");

    console.log(`[zalo-oa-callback] Received callback with code: ${code?.substring(0, 10)}..., oa_id: ${oaId}`);

    if (!code) {
      console.error("[zalo-oa-callback] No authorization code provided");
      return new Response(
        `<html><body><h1>Lỗi</h1><p>Không nhận được authorization code từ Zalo.</p></body></html>`,
        { headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' }, status: 400 }
      );
    }

    if (!ZALO_APP_ID || !ZALO_APP_SECRET) {
      console.error("[zalo-oa-callback] Missing Zalo app credentials");
      return new Response(
        `<html><body><h1>Lỗi</h1><p>Thiếu cấu hình Zalo App.</p></body></html>`,
        { headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' }, status: 500 }
      );
    }

    // Exchange authorization code for access token
    console.log("[zalo-oa-callback] Exchanging code for access token...");
    
    const tokenResponse = await fetch("https://oauth.zaloapp.com/v4/oa/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "secret_key": ZALO_APP_SECRET
      },
      body: new URLSearchParams({
        code: code,
        app_id: ZALO_APP_ID,
        grant_type: "authorization_code"
      })
    });

    const tokenData = await tokenResponse.json();
    console.log("[zalo-oa-callback] Token response:", JSON.stringify(tokenData));

    if (tokenData.error) {
      console.error("[zalo-oa-callback] Token exchange error:", tokenData);
      return new Response(
        `<html><body><h1>Lỗi</h1><p>Không thể lấy access token: ${tokenData.error_description || tokenData.error}</p></body></html>`,
        { headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' }, status: 400 }
      );
    }

    const { access_token, refresh_token, expires_in } = tokenData;
    
    if (!access_token || !refresh_token) {
      console.error("[zalo-oa-callback] Missing tokens in response:", tokenData);
      return new Response(
        `<html><body><h1>Lỗi</h1><p>Response không chứa access_token hoặc refresh_token.</p></body></html>`,
        { headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' }, status: 400 }
      );
    }

    // Get OA info to get oa_id
    console.log("[zalo-oa-callback] Fetching OA info...");
    const oaInfoResponse = await fetch("https://openapi.zalo.me/v2.0/oa/getoa", {
      headers: {
        "access_token": access_token
      }
    });

    const oaInfo = await oaInfoResponse.json();
    console.log("[zalo-oa-callback] OA info:", JSON.stringify(oaInfo));

    const finalOaId = oaInfo.data?.oa_id || oaId || "default";

    // Calculate expiration time
    const expiresAt = new Date(Date.now() + (expires_in || 86400) * 1000);

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Upsert token into database
    const { error: upsertError } = await supabase
      .from('zalo_oa_tokens')
      .upsert({
        oa_id: finalOaId,
        access_token: access_token,
        refresh_token: refresh_token,
        expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString()
      }, { 
        onConflict: 'oa_id' 
      });

    if (upsertError) {
      console.error("[zalo-oa-callback] Database upsert error:", upsertError);
      return new Response(
        `<html><body><h1>Lỗi</h1><p>Không thể lưu token: ${upsertError.message}</p></body></html>`,
        { headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' }, status: 500 }
      );
    }

    console.log(`[zalo-oa-callback] Successfully saved tokens for OA: ${finalOaId}`);

    // Return success page
    return new Response(
      `<html>
        <head>
          <meta charset="utf-8">
          <title>Kết nối Zalo OA thành công</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
            .container { background: white; padding: 40px; border-radius: 10px; max-width: 500px; margin: 0 auto; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            h1 { color: #00b14f; }
            p { color: #666; }
            .oa-id { background: #f0f0f0; padding: 10px; border-radius: 5px; font-family: monospace; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>✅ Kết nối thành công!</h1>
            <p>Zalo Official Account đã được kết nối với TAPI.</p>
            <p>OA ID: <span class="oa-id">${finalOaId}</span></p>
            <p>Token sẽ hết hạn vào: ${expiresAt.toLocaleString('vi-VN')}</p>
            <p>Bạn có thể đóng trang này.</p>
          </div>
        </body>
      </html>`,
      { headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' } }
    );
  } catch (error) {
    console.error("[zalo-oa-callback] Unexpected error:", error);
    return new Response(
      `<html><body><h1>Lỗi</h1><p>Đã xảy ra lỗi: ${error.message}</p></body></html>`,
      { headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' }, status: 500 }
    );
  }
});
