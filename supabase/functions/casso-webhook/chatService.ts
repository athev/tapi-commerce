
export async function createOrderSupportChat(order: any, supabase: any) {
  try {
    console.log(`💬 Creating order support chat for order: ${order.id}`);
    
    const buyerId = order.user_id;
    const sellerId = order.products?.seller_id;

    if (!buyerId || !sellerId) {
      console.error('❌ Missing buyer or seller ID');
      return null;
    }

    // Kiểm tra xem đã có conversation chưa
    const { data: existingConversation, error: checkError } = await supabase
      .from('conversations')
      .select('id')
      .eq('buyer_id', buyerId)
      .eq('seller_id', sellerId)
      .eq('order_id', order.id)
      .eq('chat_type', 'order_support')
      .maybeSingle();

    if (checkError) {
      console.error('❌ Error checking existing conversation:', checkError);
      return null;
    }

    if (existingConversation) {
      console.log('✅ Order support conversation already exists:', existingConversation.id);
      return existingConversation.id;
    }

    // Tạo conversation mới
    const { data: newConversation, error: createError } = await supabase
      .from('conversations')
      .insert({
        buyer_id: buyerId,
        seller_id: sellerId,
        order_id: order.id,
        product_id: order.product_id,
        chat_type: 'order_support',
        last_message_at: new Date().toISOString()
      })
      .select('id')
      .single();

    if (createError) {
      console.error('❌ Error creating conversation:', createError);
      return null;
    }

    console.log('✅ New order support conversation created:', newConversation.id);

    // Tạo tin nhắn chào mừng từ system
    const { error: messageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: newConversation.id,
        sender_id: sellerId, // Tin nhắn từ seller
        content: `Chào bạn! Cảm ơn bạn đã mua sản phẩm "${order.products?.title}". Tôi sẵn sàng hỗ trợ bạn nếu có bất kỳ thắc mắc nào về đơn hàng.`,
        message_type: 'text'
      });

    if (messageError) {
      console.error('❌ Error creating welcome message:', messageError);
    } else {
      console.log('✅ Welcome message created');
    }

    return newConversation.id;

  } catch (error) {
    console.error('❌ Error in createOrderSupportChat:', error);
    return null;
  }
}
