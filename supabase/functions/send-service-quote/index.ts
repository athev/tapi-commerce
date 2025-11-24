import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { ticketId, quotedPrice, estimatedDays, notes } = await req.json();

    if (!ticketId || !quotedPrice || !estimatedDays) {
      throw new Error('Missing required fields');
    }

    // Get ticket and verify seller owns it
    const { data: ticket, error: ticketError } = await supabaseClient
      .from('service_tickets')
      .select('*')
      .eq('id', ticketId)
      .eq('seller_id', user.id)
      .single();

    if (ticketError || !ticket) {
      throw new Error('Ticket not found or unauthorized');
    }

    // Update ticket with quote
    const { error: updateError } = await supabaseClient
      .from('service_tickets')
      .update({
        status: 'quoted',
        quoted_price: quotedPrice,
        quoted_at: new Date().toISOString()
      })
      .eq('id', ticketId);

    if (updateError) throw updateError;

    // Send quote message
    const quoteData = {
      quoted_price: quotedPrice,
      estimated_days: estimatedDays,
      notes: notes || ""
    };

    await supabaseClient
      .from('messages')
      .insert({
        conversation_id: ticket.conversation_id,
        sender_id: user.id,
        content: JSON.stringify(quoteData),
        message_type: 'service_quote'
      });

    // Create notification for buyer
    await supabaseClient
      .from('notifications')
      .insert({
        user_id: ticket.buyer_id,
        type: 'service_quote',
        title: 'Đã nhận báo giá',
        message: `Người bán đã gửi báo giá ${new Intl.NumberFormat('vi-VN').format(quotedPrice)}đ`,
        action_url: `/chat/${ticket.conversation_id}`,
        priority: 'high',
        metadata: { ticket_id: ticketId, quoted_price: quotedPrice }
      });

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error sending quote:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
