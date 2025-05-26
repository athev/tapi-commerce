
import { supabase } from '@/integrations/supabase/client';

// Create order support conversation
export const createOrderSupportConversation = async (
  buyerId: string,
  sellerId: string,
  orderId: string,
  productId: string
) => {
  console.log('Creating order support conversation:', { 
    buyerId, 
    sellerId, 
    orderId,
    productId
  });

  // Check if conversation already exists for this order
  const { data: existingConv } = await supabase
    .from('conversations')
    .select('id')
    .eq('buyer_id', buyerId)
    .eq('seller_id', sellerId)
    .eq('chat_type', 'order_support')
    .eq('order_id', orderId)
    .single();

  if (existingConv) {
    console.log('Found existing order support conversation:', existingConv.id);
    return existingConv.id;
  }

  // Create new order support conversation
  const { data: newConv, error } = await supabase
    .from('conversations')
    .insert({
      buyer_id: buyerId,
      seller_id: sellerId,
      product_id: productId,
      order_id: orderId,
      chat_type: 'order_support'
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error creating order support conversation:', error);
    throw error;
  }

  console.log('Created new order support conversation:', newConv.id);
  return newConv.id;
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

  if (chatType === 'order_support' && orderId) {
    return createOrderSupportConversation(buyerId, sellerId, orderId, productId!);
  }

  // For product consultations, check if a conversation already exists between these users
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
      
      // Update the conversation with the new product
      if (productId) {
        console.log('Updating conversation with new product:', productId);
        const { updateConversationProduct } = await import('./conversationUpdater');
        await updateConversationProduct(existingConv.id, productId);
      }
      
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
