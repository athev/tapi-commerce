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

    // Step 1: Check for existing ACTIVE service ticket
    const { data: existingTickets } = await supabaseClient
      .from('service_tickets')
      .select('id, status, conversation_id')
      .eq('buyer_id', user.id)
      .eq('product_id', productId)
      .in('status', ['pending', 'quoted', 'accepted', 'in_progress'])
      .maybeSingle();

    if (existingTickets) {
      return new Response(
        JSON.stringify({ 
          error: 'Bạn đã có yêu cầu dịch vụ đang xử lý cho sản phẩm này',
          existingConversationId: existingTickets.conversation_id 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 2: Check for existing conversation with service_request type
    const { data: existingConversation } = await supabaseClient
      .from('conversations')
      .select('id')
      .eq('buyer_id', user.id)
      .eq('seller_id', sellerId)
      .eq('product_id', productId)
      .eq('chat_type', 'service_request')
      .maybeSingle();

    let conversationId: string;

    if (existingConversation) {
      // Reuse existing conversation
      conversationId = existingConversation.id;
      
      // Update last_message_at
      await supabaseClient
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversationId);
    } else {
      // Create new conversation
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
      conversationId = conversation.id;
    }

    // Step 3: Create service ticket
    const { data: ticket, error: ticketError } = await supabaseClient
      .from('service_tickets')
      .insert({
        product_id: productId,
        buyer_id: user.id,
        seller_id: sellerId,
        conversation_id: conversationId,
        title,
        description,
        request_data: requestData,
        status: 'pending'
      })
      .select()
      .single();

    if (ticketError) throw ticketError;

    // Step 4: Send initial message from buyer
    await supabaseClient
      .from('messages')
      .insert({
        conversation_id: conversationId,
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
        action_url: `/chat/${conversationId}`,
        priority: 'high',
        metadata: { ticket_id: ticket.id, conversation_id: conversationId }
      });

    return new Response(
      JSON.stringify({ 
        success: true, 
        ticket,
        conversationId 
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
