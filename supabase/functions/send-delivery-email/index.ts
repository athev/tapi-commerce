import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DeliveryEmailRequest {
  orderId: string;
  buyerEmail: string;
  productTitle: string;
  deliveryNotes?: string;
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderId, buyerEmail, productTitle, deliveryNotes }: DeliveryEmailRequest = await req.json();

    console.log("[send-delivery-email] Processing request:", { orderId, buyerEmail, productTitle });

    if (!buyerEmail || !productTitle) {
      console.error("[send-delivery-email] Missing required fields");
      return new Response(
        JSON.stringify({ error: "Missing required fields: buyerEmail and productTitle" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Generate order URL
    const appUrl = "https://navlxvufcajsozhvbulu.lovable.app";
    const orderUrl = `${appUrl}/my-purchases`;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Đơn hàng đã được giao</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">🎉 Đơn hàng đã được giao!</h1>
        </div>
        
        <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
          <p style="font-size: 16px; margin-bottom: 20px;">Xin chào,</p>
          
          <p style="font-size: 16px; margin-bottom: 20px;">
            Đơn hàng <strong>"${productTitle}"</strong> của bạn đã được người bán xác nhận giao hàng.
          </p>
          
          ${deliveryNotes ? `
          <div style="background: #fff; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
            <p style="margin: 0; font-weight: 600; color: #667eea;">📝 Ghi chú từ người bán:</p>
            <p style="margin: 10px 0 0 0; color: #666;">${deliveryNotes}</p>
          </div>
          ` : ''}
          
          <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <p style="margin: 0; font-weight: 600; color: #92400e;">⚡ Hành động cần thiết:</p>
            <p style="margin: 10px 0 0 0; color: #92400e;">
              Vui lòng xác nhận hoàn thành đơn hàng để nhận sản phẩm và được cộng điểm PI!
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${orderUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: 600; font-size: 16px;">
              Xác nhận hoàn thành đơn hàng
            </a>
          </div>
          
          <p style="font-size: 14px; color: #666; margin-top: 30px;">
            Nếu bạn gặp bất kỳ vấn đề nào với đơn hàng, vui lòng liên hệ với người bán qua hệ thống chat hoặc mở khiếu nại.
          </p>
        </div>
        
        <div style="background: #374151; padding: 20px; border-radius: 0 0 10px 10px; text-align: center;">
          <p style="color: #9ca3af; margin: 0; font-size: 14px;">
            Email này được gửi tự động từ hệ thống. Vui lòng không trả lời email này.
          </p>
        </div>
      </body>
      </html>
    `;

    console.log("[send-delivery-email] Sending email to:", buyerEmail);

    const emailResponse = await resend.emails.send({
      from: "Thông báo đơn hàng <onboarding@resend.dev>",
      to: [buyerEmail],
      subject: `📦 Đơn hàng "${productTitle}" đã được giao - Vui lòng xác nhận`,
      html: emailHtml,
    });

    console.log("[send-delivery-email] Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("[send-delivery-email] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
