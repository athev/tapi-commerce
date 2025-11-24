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

    const { ticketId } = await req.json();

    if (!ticketId) {
      throw new Error('Missing ticket ID');
    }

    // Get ticket and verify buyer owns it
    const { data: ticket, error: ticketError } = await supabaseClient
      .from('service_tickets')
      .select('*, products(*)')
      .eq('id', ticketId)
      .eq('buyer_id', user.id)
      .eq('status', 'quoted')
      .single();

    if (ticketError || !ticket) {
      throw new Error('Ticket not found, unauthorized, or not in quoted status');
    }

    if (!ticket.quoted_price) {
      throw new Error('No quoted price found');
    }

    // Create order
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .insert({
        user_id: user.id,
        product_id: ticket.product_id,
        bank_amount: ticket.quoted_price,
        status: 'pending',
        buyer_data: ticket.request_data
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Update ticket
    const { error: updateError } = await supabaseClient
      .from('service_tickets')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString(),
        order_id: order.id
      })
      .eq('id', ticketId);

    if (updateError) throw updateError;

    // Send message
    await supabaseClient
      .from('messages')
      .insert({
        conversation_id: ticket.conversation_id,
        sender_id: user.id,
        content: `Đã chấp nhận báo giá. Vui lòng chờ thanh toán để bắt đầu xử lý.`,
        message_type: 'text'
      });

    // Notify seller
    await supabaseClient
      .from('notifications')
      .insert({
        user_id: ticket.seller_id,
        type: 'quote_accepted',
        title: 'Báo giá được chấp nhận',
        message: 'Khách hàng đã chấp nhận báo giá của bạn',
        action_url: `/chat/${ticket.conversation_id}`,
        priority: 'high',
        metadata: { ticket_id: ticketId, order_id: order.id }
      });

    return new Response(
      JSON.stringify({ success: true, orderId: order.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error accepting quote:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
