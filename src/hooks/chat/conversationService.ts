
import { supabase } from '@/integrations/supabase/client';
import { Conversation } from './types';

export const fetchConversationsData = async (userId: string) => {
  console.log('Fetching conversations for user:', userId);

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
    console.error('Error fetching conversations:', error);
    throw error;
  }

  console.log('Raw conversations data:', conversationsData);
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

export const processConversations = (conversationsData: any[], profiles: any[], userId: string): Conversation[] => {
  const profileMap = new Map();
  profiles.forEach(profile => {
    profileMap.set(profile.id, profile);
  });

  // Group conversations by user pairs and process
  const conversationGroups = new Map<string, any[]>();
  
  conversationsData.forEach(conv => {
    const buyerProfile = profileMap.get(conv.buyer_id);
    const sellerProfile = profileMap.get(conv.seller_id);
    const otherUserId = conv.buyer_id === userId ? conv.seller_id : conv.buyer_id;
    
    // Create a unique key for each user pair
    const pairKey = [conv.buyer_id, conv.seller_id].sort().join('-');
    
    if (!conversationGroups.has(pairKey)) {
      conversationGroups.set(pairKey, []);
    }
    
    conversationGroups.get(pairKey)!.push({
      ...conv,
      buyerProfile,
      sellerProfile,
      otherUserId
    });
  });

  const processedConversations: Conversation[] = [];

  // Process each group
  conversationGroups.forEach((groupConvs, pairKey) => {
    // Sort conversations in group by last message time
    groupConvs.sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime());
    
    // For each chat type, create separate conversations but with grouped context
    const orderChats = groupConvs.filter(c => c.chat_type === 'order_support');
    const productChats = groupConvs.filter(c => c.chat_type === 'product_consultation');
    
    // Add order support conversations
    orderChats.forEach(conv => {
      const otherUserProfile = profileMap.get(conv.otherUserId);
      processedConversations.push({
        ...conv,
        chat_type: 'order_support' as const,
        product: conv.products,
        order: conv.orders,
        other_user: otherUserProfile,
        buyer_name: conv.buyerProfile?.full_name || 'Khách hàng',
        seller_name: conv.sellerProfile?.full_name || conv.products?.seller_name || 'Người bán',
        // Add related context from same user pair
        related_products: productChats.map(pc => pc.products).filter(Boolean),
        related_orders: orderChats.filter(oc => oc.id !== conv.id).map(oc => oc.orders).filter(Boolean)
      });
    });
    
    // For product consultations, group by user pair
    if (productChats.length > 0) {
      // Use the most recent product chat as the main conversation
      const mainConv = productChats[0];
      const otherUserProfile = profileMap.get(mainConv.otherUserId);
      
      processedConversations.push({
        ...mainConv,
        chat_type: 'product_consultation' as const,
        product: mainConv.products,
        order: mainConv.orders,
        other_user: otherUserProfile,
        buyer_name: mainConv.buyerProfile?.full_name || 'Khách hàng',
        seller_name: mainConv.sellerProfile?.full_name || mainConv.products?.seller_name || 'Người bán',
        // Add all products discussed with this user
        related_products: productChats.map(pc => pc.products).filter(Boolean),
        related_orders: orderChats.map(oc => oc.orders).filter(Boolean)
      });
    }
  });

  // Sort final conversations by last message time
  processedConversations.sort((a, b) => 
    new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
  );

  console.log('Processed conversations with grouping:', processedConversations);
  return processedConversations;
};

export const createConversation = async (
  buyerId: string,
  sellerId: string,
  productId?: string,
  orderId?: string,
  chatType: 'product_consultation' | 'order_support' = 'product_consultation'
) => {
  console.log('Creating conversation:', { 
    buyerId, 
    sellerId, 
    productId, 
    orderId, 
    chatType 
  });

  // For product consultations, check if a conversation already exists between these users
  // regardless of the specific product (since we group by user pairs)
  if (chatType === 'product_consultation') {
    const { data: existingConv } = await supabase
      .from('conversations')
      .select('id')
      .eq('buyer_id', buyerId)
      .eq('seller_id', sellerId)
      .eq('chat_type', 'product_consultation')
      .order('last_message_at', { ascending: false })
      .limit(1)
      .single();

    if (existingConv) {
      console.log('Found existing product consultation conversation:', existingConv.id);
      return existingConv.id;
    }
  } else {
    // For order support, check for specific order
    const { data: existingConv } = await supabase
      .from('conversations')
      .select('id')
      .eq('buyer_id', buyerId)
      .eq('seller_id', sellerId)
      .eq('chat_type', chatType)
      .eq('order_id', orderId)
      .single();

    if (existingConv) {
      console.log('Found existing order support conversation:', existingConv.id);
      return existingConv.id;
    }
  }

  // Create new conversation
  const conversationData: any = {
    buyer_id: buyerId,
    seller_id: sellerId,
    chat_type: chatType
  };

  if (orderId) {
    conversationData.order_id = orderId;
  }
  if (productId) {
    conversationData.product_id = productId;
  }

  const { data: newConv, error } = await supabase
    .from('conversations')
    .insert(conversationData)
    .select('id')
    .single();

  if (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }

  console.log('Created new conversation:', newConv.id);
  return newConv.id;
};

// New function to find valid conversation for a user pair
export const findValidConversation = async (
  userId: string,
  otherUserId: string,
  chatType?: 'product_consultation' | 'order_support'
) => {
  console.log('Finding valid conversation between users:', { userId, otherUserId, chatType });

  let query = supabase
    .from('conversations')
    .select('id, chat_type, last_message_at')
    .or(`and(buyer_id.eq.${userId},seller_id.eq.${otherUserId}),and(buyer_id.eq.${otherUserId},seller_id.eq.${userId})`)
    .order('last_message_at', { ascending: false });

  if (chatType) {
    query = query.eq('chat_type', chatType);
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
