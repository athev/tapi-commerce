
import { supabase } from '@/integrations/supabase/client';

// Create order support conversation
// Can be initiated by either buyer or seller
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

  // 1) Check if conversation already exists for this specific order
  const { data: existingOrderConv } = await supabase
    .from('conversations')
    .select('id')
    .eq('buyer_id', buyerId)
    .eq('seller_id', sellerId)
    .eq('chat_type', 'order_support')
    .eq('order_id', orderId)
    .maybeSingle();

  if (existingOrderConv) {
    console.log('Found existing order support conversation for this order:', existingOrderConv.id);
    return existingOrderConv.id;
  }

  // 2) Find existing conversation by (buyer, seller, product) regardless of chat_type
  const { data: existingByProduct } = await supabase
    .from('conversations')
    .select('id, chat_type, order_id')
    .eq('buyer_id', buyerId)
    .eq('seller_id', sellerId)
    .eq('product_id', productId)
    .order('last_message_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existingByProduct) {
    // If it's not order_support or doesn't have order_id, upgrade it
    const needsUpgrade =
      existingByProduct.chat_type !== 'order_support' || !existingByProduct.order_id;

    if (needsUpgrade) {
      console.log('Upgrading existing conversation to order_support:', existingByProduct.id);
      const { data: upgraded, error: upgradeError } = await supabase
        .from('conversations')
        .update({ 
          chat_type: 'order_support', 
          order_id: orderId
        })
        .eq('id', existingByProduct.id)
        .select('id')
        .single();

      if (upgradeError) {
        console.error('Error upgrading conversation:', upgradeError);
        throw upgradeError;
      }
      console.log('Upgraded conversation:', upgraded.id);
      return upgraded.id;
    }

    console.log('Found existing conversation:', existingByProduct.id);
    return existingByProduct.id;
  }

  // 3) No existing conversation, use upsert to avoid 409 conflicts
  try {
    const { data: upserted, error } = await supabase
      .from('conversations')
      .upsert(
        [{
          buyer_id: buyerId,
          seller_id: sellerId,
          product_id: productId,
          order_id: orderId,
          chat_type: 'order_support'
        }],
        { onConflict: 'buyer_id,seller_id,product_id' }
      )
      .select('id')
      .single();

    if (error) throw error;
    console.log('Created new order support conversation:', upserted.id);
    return upserted.id;
  } catch (e: any) {
    // 4) Edge case: if still 23505 error, fallback to query and update
    if (e?.code === '23505') {
      console.log('Conflict detected, fetching existing conversation...');
      const { data: conflictRow } = await supabase
        .from('conversations')
        .select('id, order_id, chat_type')
        .eq('buyer_id', buyerId)
        .eq('seller_id', sellerId)
        .eq('product_id', productId)
        .maybeSingle();

      if (conflictRow) {
        if (conflictRow.chat_type !== 'order_support' || !conflictRow.order_id) {
          const { data: upgraded } = await supabase
            .from('conversations')
            .update({ 
              chat_type: 'order_support', 
              order_id: orderId
            })
            .eq('id', conflictRow.id)
            .select('id')
            .single();

          console.log('Updated conflict conversation:', upgraded?.id);
          return upgraded?.id ?? conflictRow.id;
        }
        console.log('Using existing conflict conversation:', conflictRow.id);
        return conflictRow.id;
      }
    }
    console.error('Error creating order support conversation:', e);
    throw e;
  }
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

  if (chatType === 'order_support' && orderId && productId) {
    return createOrderSupportConversation(buyerId, sellerId, orderId, productId);
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
      .maybeSingle();

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
