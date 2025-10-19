import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useNotificationSound } from './useNotificationSound';
import { toast } from 'sonner';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  priority?: 'high' | 'normal' | 'low';
  action_url?: string;
  metadata?: any;
  related_order_id?: string;
  created_at: string;
  read_at?: string;
}

export const useRealtimeNotifications = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { playSound } = useNotificationSound();
  const [isConnected, setIsConnected] = useState(false);

  // Fetch notifications
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data as Notification[];
    },
    enabled: !!user?.id,
    refetchOnWindowFocus: true
  });

  // Count unread notifications
  const unreadCount = notifications.filter(n => !n.is_read).length;

  // Subscribe to real-time updates
  useEffect(() => {
    if (!user?.id) return;

    console.log('🔔 Setting up realtime notifications for user:', user.id);

    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('🔔 New notification received:', payload.new);
          
          const newNotification = payload.new as Notification;
          
          // Play sound based on priority
          const soundType = newNotification.priority === 'high' ? 'high' : 
                           newNotification.priority === 'low' ? 'low' : 'normal';
          playSound(soundType);
          
          // Handle new_message notifications intelligently
          if (newNotification.type === 'new_message') {
            const currentPath = window.location.pathname;
            const currentUrl = window.location.href;
            const conversationId = newNotification.metadata?.conversation_id;
            
            console.log('🔔 [NEW_MESSAGE] Processing:', {
              conversationId,
              currentPath,
              currentUrl
            });
            
            // Check if user is viewing this specific conversation
            const isViewingThisChat = conversationId && (
              currentPath === `/chat/${conversationId}` || // Direct route match
              (currentPath === '/chat' && currentUrl.includes(conversationId)) || // Chat list with this convo selected
              currentPath.startsWith(`/chat/${conversationId}`) // Any sub-route
            );
            
            if (isViewingThisChat) {
              console.log('🔕 User is viewing this conversation, skipping toast but playing sound');
              // Still play sound and update badge, but don't show toast
              queryClient.invalidateQueries({ queryKey: ['notifications', user.id] });
              return;
            }
            
            console.log('🔔 Showing toast notification for new message');
            // Show toast with "Xem ngay" button for other pages
            toast(newNotification.title, {
              description: newNotification.message,
              action: {
                label: 'Xem ngay',
                onClick: () => {
                  if (newNotification.action_url) {
                    window.location.href = newNotification.action_url;
                  }
                }
              },
              duration: 5000
            });
          } else {
            // Show regular toast for other notification types
            toast(newNotification.title, {
              description: newNotification.message,
              action: newNotification.action_url ? {
                label: 'Xem',
                onClick: () => window.location.href = newNotification.action_url!
              } : undefined,
              duration: 5000
            });
          }
          
          // Invalidate query to refetch
          queryClient.invalidateQueries({ queryKey: ['notifications', user.id] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('🔔 Notification updated:', payload.new);
          queryClient.invalidateQueries({ queryKey: ['notifications', user.id] });
        }
      )
      .subscribe((status) => {
        console.log('🔔 Notification channel status:', status);
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      console.log('🔔 Cleaning up notification subscription');
      supabase.removeChannel(channel);
    };
  }, [user?.id, playSound, queryClient]);

  // Mark as read
  const markAsRead = async (notificationId: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ 
        is_read: true, 
        read_at: new Date().toISOString() 
      })
      .eq('id', notificationId);
    
    if (!error) {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
    }
    
    return { error };
  };

  // Mark all as read
  const markAllAsRead = async () => {
    if (!user?.id) return;
    
    const { error } = await supabase
      .from('notifications')
      .update({ 
        is_read: true,
        read_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .eq('is_read', false);
    
    if (!error) {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
    }
    
    return { error };
  };

  return {
    notifications,
    unreadCount,
    isLoading,
    isConnected,
    markAsRead,
    markAllAsRead
  };
};
