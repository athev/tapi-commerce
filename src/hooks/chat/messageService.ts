
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

  console.log('✅ [MESSAGE] Message sent successfully. Database trigger will create notification automatically.');
  
  return messageData;
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
