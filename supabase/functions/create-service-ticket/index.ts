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

    const { productId, sellerId, title, description, requestData } = await req.json();

    if (!productId || !sellerId || !title || !description) {
      throw new Error('Missing required fields');
    }

    // Create conversation first
    const { data: conversation, error: convError } = await supabaseClient
      .from('conversations')
      .insert({
        buyer_id: user.id,
        seller_id: sellerId,
        product_id: productId,
        chat_type: 'service_request',
        last_message_at: new Date().toISOString()
      })
      .select()
      .single();

    if (convError) throw convError;

    // Create service ticket
    const { data: ticket, error: ticketError } = await supabaseClient
      .from('service_tickets')
      .insert({
        product_id: productId,
        buyer_id: user.id,
        seller_id: sellerId,
        conversation_id: conversation.id,
        title,
        description,
        request_data: requestData,
        status: 'pending'
      })
      .select()
      .single();

    if (ticketError) throw ticketError;

    // Send initial message from buyer
    await supabaseClient
      .from('messages')
      .insert({
        conversation_id: conversation.id,
        sender_id: user.id,
        content: `Yêu cầu dịch vụ:\n\n${description}`,
        message_type: 'text'
      });

    // Create notification for seller
    await supabaseClient
      .from('notifications')
      .insert({
        user_id: sellerId,
        type: 'service_request',
        title: 'Yêu cầu dịch vụ mới',
        message: `Bạn có yêu cầu dịch vụ mới: ${title}`,
        action_url: `/chat/${conversation.id}`,
        priority: 'high',
        metadata: { ticket_id: ticket.id, conversation_id: conversation.id }
      });

    return new Response(
      JSON.stringify({ 
        success: true, 
        ticket,
        conversationId: conversation.id 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error creating service ticket:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
