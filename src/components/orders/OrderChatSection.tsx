import { useState, useEffect } from "react";
import { useChat } from "@/hooks/useChat";
import { Loader2 } from "lucide-react";
import CompactChatWindow from "@/components/chat/CompactChatWindow";
import { supabase } from "@/integrations/supabase/client";

interface OrderChatSectionProps {
  orderId: string;
  sellerId: string;
}

const OrderChatSection = ({ orderId, sellerId }: OrderChatSectionProps) => {
  const { createOrderSupportConversation } = useChat();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    
    const initChat = async () => {
      try {
        setLoading(true);
        setError(null);

        // Query DB directly for existing conversation
        const { data: existing, error: exErr } = await supabase
          .from('conversations')
          .select('id')
          .eq('order_id', orderId)
          .eq('chat_type', 'order_support')
          .maybeSingle();

        if (exErr) {
          console.warn('Error finding conversation:', exErr);
        }

        if (mounted && existing?.id) {
          console.log('Found existing order conversation:', existing.id);
          setConversationId(existing.id);
        } else {
          // Create new conversation with correct buyer_id
          console.log('Creating new order support conversation');
          const convId = await createOrderSupportConversation(orderId, sellerId);
          if (mounted && convId) {
            setConversationId(convId);
          } else if (mounted) {
            setError('Không thể tạo cuộc trò chuyện');
          }
        }
      } catch (err) {
        console.error('Error initializing chat:', err);
        if (mounted) {
          setError('Có lỗi xảy ra khi tải chat');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initChat();
    
    return () => {
      mounted = false;
    };
  }, [orderId, sellerId, createOrderSupportConversation]);

  if (loading) {
    return (
      <div className="h-[400px] flex items-center justify-center border rounded-lg bg-muted/50">
        <div className="text-center">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Đang tải chat...</p>
        </div>
      </div>
    );
  }

  if (error || !conversationId) {
    return (
      <div className="h-[400px] flex items-center justify-center border rounded-lg bg-muted/50">
        <p className="text-sm text-muted-foreground">{error || 'Không thể tải chat'}</p>
      </div>
    );
  }

  return (
    <div className="h-[400px] border rounded-lg overflow-hidden">
      <CompactChatWindow conversationId={conversationId} />
    </div>
  );
};

export default OrderChatSection;
