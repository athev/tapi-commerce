
import { Conversation } from './types';

export const processConversations = (conversationsData: any[], profiles: any[], userId: string): Conversation[] => {
  console.log('🔄 [PROCESS_CONVERSATIONS] Processing conversations:', conversationsData.length);
  
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
    
    // Separate by chat type
    const orderChats = groupConvs.filter(c => c.chat_type === 'order_support');
    const productChats = groupConvs.filter(c => c.chat_type === 'product_consultation');
    const serviceChats = groupConvs.filter(c => c.chat_type === 'service_request');
    
    console.log(`📊 [PROCESS_CONVERSATIONS] Group ${pairKey}:`, {
      orderChats: orderChats.length,
      productChats: productChats.length,
      serviceChats: serviceChats.length
    });
    
    // Add service request conversations (each service gets its own conversation)
    serviceChats.forEach(conv => {
      const otherUserProfile = profileMap.get(conv.otherUserId);
      console.log(`🛠️ [PROCESS_CONVERSATIONS] Adding service_request conversation:`, conv.id);
      processedConversations.push({
        ...conv,
        chat_type: 'service_request' as const,
        product: conv.products,
        order: conv.orders,
        other_user: otherUserProfile,
        buyer_name: conv.buyerProfile?.full_name || 'Khách hàng',
        seller_name: conv.sellerProfile?.full_name || conv.products?.seller_name || 'Người bán',
        related_products: productChats.map(pc => pc.products).filter(Boolean),
        related_orders: orderChats.map(oc => oc.orders).filter(Boolean)
      });
    });
    
    // Add order support conversations (each order gets its own conversation)
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
        related_products: productChats.map(pc => pc.products).filter(Boolean),
        related_orders: orderChats.filter(oc => oc.id !== conv.id).map(oc => oc.orders).filter(Boolean)
      });
    });
    
    // For product consultations, group by user pair (existing logic)
    if (productChats.length > 0) {
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
        related_products: productChats.map(pc => pc.products).filter(Boolean),
        related_orders: orderChats.map(oc => oc.orders).filter(Boolean)
      });
    }
  });

  // Sort final conversations by last message time
  processedConversations.sort((a, b) => 
    new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
  );

  console.log('✅ [PROCESS_CONVERSATIONS] Final processed conversations:', processedConversations.length);
  processedConversations.forEach((conv, index) => {
    console.log(`📝 [PROCESS_CONVERSATIONS] Conversation ${index + 1}:`, {
      id: conv.id,
      chat_type: conv.chat_type,
      has_product: !!conv.product,
      has_order: !!conv.order
    });
  });

  return processedConversations;
};
