import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { MessageCircle } from "lucide-react";
import OrderCommentForm from "./OrderCommentForm";
import OrderCommentItem from "./OrderCommentItem";
import { useToast } from "@/hooks/use-toast";

interface OrderCommentsProps {
  orderId: string;
  sellerId: string;
}

interface Comment {
  id: string;
  content: string;
  sender_id: string;
  sender_name?: string;
  sender_role?: string;
  created_at: string;
}

const OrderComments = ({ orderId, sellerId }: OrderCommentsProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeConversation = async () => {
      if (!user) return;

      try {
        // Find or create conversation for this order
        const { data: existingConv } = await supabase
          .from('conversations')
          .select('id')
          .eq('order_id', orderId)
          .eq('chat_type', 'order_support')
          .maybeSingle();

        if (existingConv) {
          setConversationId(existingConv.id);
          await loadComments(existingConv.id);
        } else {
          // Create new conversation
          const { data: newConv, error } = await supabase
            .from('conversations')
            .insert({
              buyer_id: user.id,
              seller_id: sellerId,
              order_id: orderId,
              chat_type: 'order_support'
            })
            .select('id')
            .single();

          if (error) throw error;
          setConversationId(newConv.id);
        }
      } catch (error) {
        console.error('Error initializing conversation:', error);
        toast({
          title: "Lỗi",
          description: "Không thể tải bình luận",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    initializeConversation();
  }, [orderId, sellerId, user, toast]);

  const loadComments = async (convId: string) => {
    try {
      const { data: messages, error } = await supabase
        .from('messages')
        .select('id, content, sender_id, created_at')
        .eq('conversation_id', convId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Fetch sender profiles
      const senderIds = [...new Set(messages?.map(m => m.sender_id) || [])];
      if (senderIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, role')
          .in('id', senderIds);

        const commentsWithProfiles = messages?.map(msg => ({
          ...msg,
          sender_name: profiles?.find(p => p.id === msg.sender_id)?.full_name || 'Người dùng',
          sender_role: profiles?.find(p => p.id === msg.sender_id)?.role || 'end-user'
        }));

        setComments(commentsWithProfiles || []);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const handleAddComment = async (content: string) => {
    if (!user || !conversationId) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content,
          message_type: 'text'
        });

      if (error) throw error;

      await loadComments(conversationId);
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Lỗi",
        description: "Không thể gửi bình luận",
        variant: "destructive"
      });
    }
  };

  // Realtime subscription
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`order-comments-${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      }, () => {
        loadComments(conversationId);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <MessageCircle className="h-4 w-4" />
          <span>Trao đổi về đơn hàng</span>
        </div>
        <p className="text-sm text-muted-foreground">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium">
        <MessageCircle className="h-4 w-4" />
        <span>Trao đổi về đơn hàng</span>
      </div>

      <div className="space-y-3 max-h-[300px] overflow-y-auto">
        {comments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Chưa có bình luận nào. Hãy là người đầu tiên!
          </p>
        ) : (
          comments.map(comment => (
            <OrderCommentItem key={comment.id} comment={comment} currentUserId={user?.id} />
          ))
        )}
      </div>

      <OrderCommentForm onSubmit={handleAddComment} />
    </div>
  );
};

export default OrderComments;
