
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'image' | 'emoji';
  image_url?: string;
  is_read: boolean;
  created_at: string;
  sender_name?: string;
}

export interface Conversation {
  id: string;
  buyer_id: string;
  seller_id: string;
  product_id?: string;
  last_message_at: string;
  buyer_unread_count: number;
  seller_unread_count: number;
  created_at: string;
  product?: {
    id: string;
    title: string;
    image?: string;
  };
  other_user?: {
    id: string;
    full_name: string;
  };
}

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

      const { data: conversationsData, error } = await supabase
        .from('conversations')
        .select(`
          *,
          products:product_id (id, title, image)
        `)
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false });

      if (error) throw error;

      // Get user profiles separately
      const userIds = new Set<string>();
      conversationsData?.forEach(conv => {
        if (conv.buyer_id !== user.id) userIds.add(conv.buyer_id);
        if (conv.seller_id !== user.id) userIds.add(conv.seller_id);
      });

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', Array.from(userIds));

      const profileMap = new Map();
      profiles?.forEach(profile => {
        profileMap.set(profile.id, profile);
      });

      const processedConversations = conversationsData?.map(conv => ({
        ...conv,
        product: conv.products,
        other_user: profileMap.get(conv.buyer_id === user.id ? conv.seller_id : conv.buyer_id)
      })) || [];

      setConversations(processedConversations);
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
      const { data: messagesData, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Get sender names separately
      const senderIds = new Set<string>();
      messagesData?.forEach(msg => senderIds.add(msg.sender_id));

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', Array.from(senderIds));

      const profileMap = new Map();
      profiles?.forEach(profile => {
        profileMap.set(profile.id, profile);
      });

      const processedMessages = messagesData?.map(msg => ({
        ...msg,
        message_type: msg.message_type as 'text' | 'image' | 'emoji',
        sender_name: profileMap.get(msg.sender_id)?.full_name
      })) || [];

      setMessages(processedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải tin nhắn",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Create or get conversation
  const createOrGetConversation = async (sellerId: string, productId?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check if conversation already exists
      let { data: existingConv } = await supabase
        .from('conversations')
        .select('id')
        .eq('buyer_id', user.id)
        .eq('seller_id', sellerId)
        .eq('product_id', productId || null)
        .single();

      if (existingConv) {
        return existingConv.id;
      }

      // Create new conversation
      const { data: newConv, error } = await supabase
        .from('conversations')
        .insert({
          buyer_id: user.id,
          seller_id: sellerId,
          product_id: productId || null
        })
        .select('id')
        .single();

      if (error) throw error;
      return newConv.id;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  };

  // Send message
  const sendMessage = async (conversationId: string, content: string, messageType: 'text' | 'image' = 'text', imageUrl?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content,
          message_type: messageType,
          image_url: imageUrl
        });

      if (error) throw error;

      // Mark messages as read for sender
      await markMessagesAsRead(conversationId);
      
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

      // Update unread count for current user
      const { data: conversation } = await supabase
        .from('conversations')
        .select('buyer_id, seller_id')
        .eq('id', conversationId)
        .single();

      if (!conversation) return;

      const isbuyer = conversation.buyer_id === user.id;
      const updateField = isbuyer ? 'buyer_unread_count' : 'seller_unread_count';

      await supabase
        .from('conversations')
        .update({ [updateField]: 0 })
        .eq('id', conversationId);

    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  // Upload image
  const uploadImage = async (file: File) => {
    try {
      if (file.size > 2 * 1024 * 1024) {
        throw new Error('File size must be less than 2MB');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('chat-images')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('chat-images')
        .getPublicUrl(data.path);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  // Set up realtime subscriptions
  useEffect(() => {
    const conversationsChannel = supabase
      .channel('conversations-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'conversations'
      }, () => {
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
        if (payload.new.conversation_id === currentConversation) {
          fetchMessages(currentConversation);
        }
      })
      .subscribe();

    return () => {
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
    sendMessage,
    markMessagesAsRead,
    uploadImage,
    fetchConversations
  };
};
