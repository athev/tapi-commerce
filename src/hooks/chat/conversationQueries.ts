
import { supabase } from '@/integrations/supabase/client';

export const fetchConversationsData = async (userId: string) => {
  console.log('🔍 [FETCH_CONVERSATIONS] Fetching conversations for user:', userId);

  const { data: conversationsData, error } = await supabase
    .from('conversations')
    .select(`
      *,
      products:product_id (id, title, image, seller_name, product_type),
      orders:order_id (id, status, created_at, delivery_status, products(title, price))
    `)
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .order('last_message_at', { ascending: false });

  if (error) {
    console.error('❌ [FETCH_CONVERSATIONS] Error fetching conversations:', error);
    throw error;
  }

  console.log('✅ [FETCH_CONVERSATIONS] Raw conversations data:', conversationsData);
  console.log('📊 [FETCH_CONVERSATIONS] Total conversations found:', conversationsData?.length || 0);
  
  // Log each conversation details for debugging
  conversationsData?.forEach((conv, index) => {
    console.log(`📝 [FETCH_CONVERSATIONS] Conversation ${index + 1}:`, {
      id: conv.id,
      chat_type: conv.chat_type,
      buyer_id: conv.buyer_id,
      seller_id: conv.seller_id,
      product_id: conv.product_id,
      order_id: conv.order_id,
      has_product: !!conv.products,
      has_order: !!conv.orders
    });
  });

  return conversationsData;
};

export const fetchUserProfiles = async (userIds: string[]) => {
  console.log('Fetching profiles for users:', userIds);

  if (userIds.length === 0) return [];

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .in('id', userIds);

  if (error) {
    console.error('Error fetching profiles:', error);
    throw error;
  }

  console.log('Fetched profiles:', profiles);
  return profiles || [];
};

// Find conversation between two users for specific chat type
export const findValidConversation = async (
  userId: string,
  otherUserId: string,
  chatType?: 'product_consultation' | 'order_support',
  orderId?: string
) => {
  console.log('Finding valid conversation between users:', { userId, otherUserId, chatType, orderId });

  let query = supabase
    .from('conversations')
    .select('id, chat_type, last_message_at')
    .or(`and(buyer_id.eq.${userId},seller_id.eq.${otherUserId}),and(buyer_id.eq.${otherUserId},seller_id.eq.${userId})`)
    .order('last_message_at', { ascending: false });

  if (chatType) {
    query = query.eq('chat_type', chatType);
  }

  if (chatType === 'order_support' && orderId) {
    query = query.eq('order_id', orderId);
  }

  const { data: conversations, error } = await query.limit(1);

  if (error) {
    console.error('Error finding valid conversation:', error);
    return null;
  }

  if (conversations && conversations.length > 0) {
    console.log('Found valid conversation:', conversations[0].id);
    return conversations[0].id;
  }

  console.log('No valid conversation found');
  return null;
};
