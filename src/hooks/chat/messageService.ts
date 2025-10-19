
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
  console.log('Sending message:', { conversationId, content, messageType, sender: senderId });

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
    console.error('Error sending message:', error);
    throw error;
  }

  console.log('Message sent successfully');

  // Create notification for recipient
  try {
    // Get conversation details to determine recipient
    const { data: conversation } = await supabase
      .from('conversations')
      .select('buyer_id, seller_id')
      .eq('id', conversationId)
      .single();

    if (!conversation) {
      console.error('Conversation not found');
      return;
    }

    // Determine recipient (opposite of sender)
    const recipientId = senderId === conversation.buyer_id 
      ? conversation.seller_id 
      : conversation.buyer_id;

    // Get sender profile for notification title
    const { data: senderProfile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', senderId)
      .single();

    // Create content preview
    const contentPreview = messageType === 'image' 
      ? '📷 Đã gửi một hình ảnh'
      : (content.length > 50 ? content.substring(0, 50) + '...' : content);

    // Insert notification for recipient
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
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
      });

    if (notificationError) {
      console.error('Error creating notification:', notificationError);
    } else {
      console.log('Notification created for recipient');
    }
  } catch (notificationError) {
    console.error('Error in notification creation:', notificationError);
    // Don't throw - message was sent successfully, notification is just a bonus
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
