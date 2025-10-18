
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Message, Conversation } from './chat/types';
import { 
  fetchConversationsData, 
  fetchUserProfiles, 
  processConversations,
  createConversation
} from './chat/conversationService';
import { 
  fetchMessagesData, 
  fetchMessageSenderProfiles, 
  processMessages,
  sendMessageToDb,
  markConversationMessagesAsRead
} from './chat/messageService';
import { uploadImageToStorage } from './chat/imageService';

export type { Message, Conversation };

export const useChat = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentConversation, setCurrentConversation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Get conversations for current user
  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const conversationsData = await fetchConversationsData(user.id);

      // Get user profiles for all participants
      const userIds = new Set<string>();
      conversationsData?.forEach(conv => {
        userIds.add(conv.buyer_id);
        userIds.add(conv.seller_id);
      });

      if (userIds.size > 0) {
        const profiles = await fetchUserProfiles(Array.from(userIds));
        const processedConversations = processConversations(conversationsData || [], profiles, user.id);
        setConversations(processedConversations);
      } else {
        const processedConversations: Conversation[] = conversationsData?.map(conv => ({
          ...conv,
          chat_type: (conv.chat_type as 'product_consultation' | 'order_support') || 'product_consultation',
          product: conv.products,
          order: conv.orders,
          buyer_name: 'Khách hàng',
          seller_name: conv.products?.seller_name || 'Người bán'
        })) || [];
        setConversations(processedConversations);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách cuộc trò chuyện",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Get messages for a conversation
  const fetchMessages = useCallback(async (conversationId: string) => {
    try {
      const messagesData = await fetchMessagesData(conversationId);

      // Get sender names and roles for all message senders
      const senderIds = new Set<string>();
      messagesData?.forEach(msg => senderIds.add(msg.sender_id));

      if (senderIds.size > 0) {
        const profiles = await fetchMessageSenderProfiles(Array.from(senderIds));
        const processedMessages = processMessages(messagesData || [], profiles);
        setMessages(processedMessages);
      } else {
        const processedMessages: Message[] = messagesData?.map(msg => ({
          ...msg,
          message_type: (msg.message_type as 'text' | 'image' | 'emoji') || 'text',
          sender_name: 'Người dùng',
          sender_role: 'end-user'
        })) || [];
        setMessages(processedMessages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải tin nhắn",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Create or get conversation - enhanced for immediate availability
  const createOrGetConversation = async (
    sellerId: string, 
    productId?: string, 
    orderId?: string,
    chatType: 'product_consultation' | 'order_support' = 'product_consultation'
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const conversationId = await createConversation(
        user.id,
        sellerId,
        productId,
        orderId,
        chatType
      );
      
      // Immediately refresh conversations and wait for it to complete
      await fetchConversations();
      
      return conversationId;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  };

  // Create order support conversation
  const createOrderSupportConversation = async (orderId: string, sellerId: string) => {
    try {
      // Get buyer_id and product_id from order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('user_id, product_id')
        .eq('id', orderId)
        .single();

      if (orderError || !order) {
        throw new Error('Could not find order');
      }

      // Use the actual buyer_id from the order, not current user
      const conversationId = await createConversation(
        order.user_id,    // Actual buyer_id from order
        sellerId,         // Seller_id from props
        order.product_id, // Product_id from order
        orderId,          // Order_id
        'order_support'
      );
      
      // Refresh conversations to get the new one
      await fetchConversations();
      
      return conversationId;
    } catch (error) {
      console.error('Error creating order support conversation:', error);
      throw error;
    }
  };

  // Send message
  const sendMessage = async (conversationId: string, content: string, messageType: 'text' | 'image' = 'text', imageUrl?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      await sendMessageToDb(conversationId, user.id, content, messageType, imageUrl);
      
      // Refresh messages immediately
      await fetchMessages(conversationId);
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Lỗi",
        description: "Không thể gửi tin nhắn",
        variant: "destructive"
      });
    }
  };

  // Mark messages as read
  const markMessagesAsRead = async (conversationId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await markConversationMessagesAsRead(conversationId, user.id);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  // Upload image
  const uploadImage = async (file: File) => {
    try {
      return await uploadImageToStorage(file);
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  // Set up realtime subscriptions
  useEffect(() => {
    console.log('Setting up realtime subscriptions');
    
    const conversationsChannel = supabase
      .channel('conversations-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'conversations'
      }, (payload) => {
        console.log('Conversation change detected:', payload);
        fetchConversations();
      })
      .subscribe();

    const messagesChannel = supabase
      .channel('messages-changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages'
      }, (payload) => {
        console.log('New message detected:', payload);
        if (payload.new.conversation_id === currentConversation) {
          fetchMessages(currentConversation);
        }
        // Always refresh conversations to update unread counts
        fetchConversations();
      })
      .subscribe();

    return () => {
      console.log('Cleaning up realtime subscriptions');
      supabase.removeChannel(conversationsChannel);
      supabase.removeChannel(messagesChannel);
    };
  }, [currentConversation, fetchConversations, fetchMessages]);

  // Load initial data
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Load messages when conversation changes
  useEffect(() => {
    if (currentConversation) {
      fetchMessages(currentConversation);
      markMessagesAsRead(currentConversation);
    }
  }, [currentConversation, fetchMessages]);

  return {
    conversations,
    messages,
    currentConversation,
    loading,
    setCurrentConversation,
    createOrGetConversation,
    createOrderSupportConversation,
    sendMessage,
    markMessagesAsRead,
    uploadImage,
    fetchConversations
  };
};
