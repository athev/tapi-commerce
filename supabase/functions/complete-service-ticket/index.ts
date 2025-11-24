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

    const { ticketId, completionNotes } = await req.json();

    if (!ticketId) {
      throw new Error('Missing ticket ID');
    }

    // Get ticket
    const { data: ticket, error: ticketError } = await supabaseClient
      .from('service_tickets')
      .select('*')
      .eq('id', ticketId)
      .eq('buyer_id', user.id)
      .eq('status', 'in_progress')
      .single();

    if (ticketError || !ticket) {
      throw new Error('Ticket not found, unauthorized, or not in progress');
    }

    // Update ticket to completed
    const { error: updateError } = await supabaseClient
      .from('service_tickets')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        completion_notes: completionNotes || ""
      })
      .eq('id', ticketId);

    if (updateError) throw updateError;

    // Update order status
    if (ticket.order_id) {
      await supabaseClient
        .from('orders')
        .update({ 
          status: 'completed',
          delivery_status: 'delivered' 
        })
        .eq('id', ticket.order_id);
    }

    // Get seller wallet
    const { data: wallet } = await supabaseClient
      .from('wallets')
      .select('*')
      .eq('user_id', ticket.seller_id)
      .single();

    if (wallet && ticket.quoted_price) {
      // Release payment to seller
      const piAmount = ticket.quoted_price * 0.90; // 90% to seller, 10% platform fee
      
      await supabaseClient
        .from('wallets')
        .update({
          pending: wallet.pending - piAmount,
          available: wallet.available + piAmount,
          total_earned: wallet.total_earned + piAmount
        })
        .eq('user_id', ticket.seller_id);

      // Create wallet log
      await supabaseClient
        .from('wallet_logs')
        .insert({
          wallet_id: wallet.id,
          order_id: ticket.order_id,
          type: 'service_completion',
          pi_amount: piAmount,
          vnd_amount: ticket.quoted_price,
          status: 'completed',
          description: `Hoàn thành dịch vụ: ${ticket.title}`,
          release_date: new Date().toISOString()
        });
    }

    // Send message
    await supabaseClient
      .from('messages')
      .insert({
        conversation_id: ticket.conversation_id,
        sender_id: user.id,
        content: `✅ Dịch vụ đã hoàn thành. ${completionNotes || "Cảm ơn bạn!"}`,
        message_type: 'text'
      });

    // Notify seller
    await supabaseClient
      .from('notifications')
      .insert({
        user_id: ticket.seller_id,
        type: 'service_completed',
        title: 'Dịch vụ hoàn thành',
        message: 'Khách hàng đã xác nhận hoàn thành dịch vụ',
        action_url: `/seller-dashboard/wallet`,
        priority: 'high',
        metadata: { ticket_id: ticketId }
      });

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error completing ticket:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
