
import { supabase } from '@/integrations/supabase/client';
import { Message } from './types';

export const fetchMessagesData = async (conversationId: string) => {
  console.log('Fetching messages for conversation:', conversationId);
  
  const { data: messagesData, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }

  console.log('Raw messages data:', messagesData);
  return messagesData;
};

export const fetchMessageSenderProfiles = async (senderIds: string[]) => {
  console.log('Fetching sender profiles for:', senderIds);

  if (senderIds.length === 0) return [];

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .in('id', senderIds);

  if (error) {
    console.error('Error fetching sender profiles:', error);
    throw error;
  }

  console.log('Message sender profiles:', profiles);
  return profiles || [];
};

export const processMessages = (messagesData: any[], profiles: any[]): Message[] => {
  const profileMap = new Map();
  profiles.forEach(profile => {
    profileMap.set(profile.id, profile);
  });

  const processedMessages: Message[] = messagesData.map(msg => {
    const senderProfile = profileMap.get(msg.sender_id);
    console.log('Processing message:', {
      id: msg.id,
      sender_id: msg.sender_id,
      senderProfile,
      content: msg.content
    });
    
    return {
      ...msg,
      message_type: (msg.message_type as 'text' | 'image' | 'emoji') || 'text',
      sender_name: senderProfile?.full_name || 'Người dùng',
      sender_role: senderProfile?.role || 'end-user'
    };
  });

  console.log('Processed messages with sender names:', processedMessages);
  return processedMessages;
};

export const sendMessageToDb = async (
  conversationId: string,
  senderId: string,
  content: string,
  messageType: 'text' | 'image' = 'text',
  imageUrl?: string
) => {
  console.log('📧 [MESSAGE] Sending message:', { 
    conversationId, 
    senderId, 
    contentPreview: content.substring(0, 30),
    messageType 
  });

  const { data: messageData, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      content,
      message_type: messageType,
      image_url: imageUrl
    })
    .select('id')
    .single();

  if (error) {
    console.error('❌ [MESSAGE] Failed to send message:', error);
    throw error;
  }

  console.log('✅ [MESSAGE] Message sent successfully:', messageData?.id);

  // Create notification for recipient
  try {
    console.log('🔔 [NOTIFICATION] Starting notification creation...');

    // Get conversation details to determine recipient
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('buyer_id, seller_id')
      .eq('id', conversationId)
      .single();

    if (convError || !conversation) {
      console.error('❌ [NOTIFICATION] Conversation not found:', { conversationId, error: convError });
      return;
    }

    console.log('✅ [NOTIFICATION] Conversation found:', {
      conversationId,
      buyerId: conversation.buyer_id,
      sellerId: conversation.seller_id
    });

    // Determine recipient (opposite of sender)
    const recipientId = senderId === conversation.buyer_id 
      ? conversation.seller_id 
      : conversation.buyer_id;

    console.log('🎯 [NOTIFICATION] Recipient determined:', {
      senderId,
      recipientId,
      senderIsBuyer: senderId === conversation.buyer_id
    });

    // Get sender profile for notification title
    const { data: senderProfile, error: profileError } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', senderId)
      .single();

    if (profileError) {
      console.warn('⚠️ [NOTIFICATION] Could not fetch sender profile:', profileError);
    }

    console.log('👤 [NOTIFICATION] Sender profile:', {
      senderId,
      fullName: senderProfile?.full_name
    });

    // Create content preview
    const contentPreview = messageType === 'image' 
      ? '📷 Đã gửi một hình ảnh'
      : (content.length > 50 ? content.substring(0, 50) + '...' : content);

    const notificationPayload = {
      user_id: recipientId,
      type: 'new_message',
      title: `Tin nhắn mới từ ${senderProfile?.full_name || 'Người dùng'}`,
      message: contentPreview,
      priority: 'normal',
      action_url: `/chat/${conversationId}`,
      metadata: {
        conversation_id: conversationId,
        sender_id: senderId,
        message_id: messageData?.id
      }
    };

    console.log('📦 [NOTIFICATION] Payload to insert:', notificationPayload);

    // Insert notification for recipient
    const { data: notificationData, error: notificationError } = await supabase
      .from('notifications')
      .insert(notificationPayload)
      .select()
      .single();

    if (notificationError) {
      console.error('❌ [NOTIFICATION] Failed to create notification:', notificationError);
      console.error('❌ [NOTIFICATION] Error details:', {
        code: notificationError.code,
        message: notificationError.message,
        details: notificationError.details,
        hint: notificationError.hint
      });
    } else {
      console.log('✅ [NOTIFICATION] Notification created successfully:', {
        notificationId: notificationData?.id,
        recipientId,
        type: notificationData?.type
      });
    }
  } catch (notificationError) {
    console.error('💥 [NOTIFICATION] Exception in notification creation:', notificationError);
  }
};

export const markConversationMessagesAsRead = async (conversationId: string, userId: string) => {
  console.log('Marking messages as read for conversation:', conversationId);

  const { data: conversation } = await supabase
    .from('conversations')
    .select('buyer_id, seller_id')
    .eq('id', conversationId)
    .single();

  if (!conversation) return;

  const isBuyer = conversation.buyer_id === userId;
  const updateField = isBuyer ? 'buyer_unread_count' : 'seller_unread_count';

  await supabase
    .from('conversations')
    .update({ [updateField]: 0 })
    .eq('id', conversationId);

  console.log('Messages marked as read');
};
