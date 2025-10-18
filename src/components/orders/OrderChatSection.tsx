import { useState, useEffect } from "react";
import { useChat } from "@/hooks/useChat";
import { Loader2 } from "lucide-react";
import CompactChatWindow from "@/components/chat/CompactChatWindow";

interface OrderChatSectionProps {
  orderId: string;
  sellerId: string;
}

const OrderChatSection = ({ orderId, sellerId }: OrderChatSectionProps) => {
  const { createOrderSupportConversation, conversations, fetchConversations } = useChat();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initChat = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check if conversations are loaded
        if (conversations.length === 0) {
          await fetchConversations();
        }

        // Try to find existing order support conversation
        const existingConv = conversations.find(
          c => c.order_id === orderId && c.chat_type === 'order_support'
        );

        if (existingConv) {
          console.log('Found existing order conversation:', existingConv.id);
          setConversationId(existingConv.id);
        } else {
          // Create new order support conversation
          console.log('Creating new order support conversation');
          const convId = await createOrderSupportConversation(orderId, sellerId);
          if (convId) {
            setConversationId(convId);
          } else {
            setError('Không thể tạo cuộc trò chuyện');
          }
        }
      } catch (err) {
        console.error('Error initializing chat:', err);
        setError('Có lỗi xảy ra khi tải chat');
      } finally {
        setLoading(false);
      }
    };

    initChat();
  }, [orderId, sellerId, conversations, fetchConversations, createOrderSupportConversation]);

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
