import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useChat } from "@/hooks/useChat";
import { supabase } from "@/integrations/supabase/client";
import CompactChatWindow from "@/components/chat/CompactChatWindow";

interface OrderInlineChatProps {
  order: any;
  sellerId: string;
  height?: number;
}

const OrderInlineChat = ({ order, sellerId, height = 360 }: OrderInlineChatProps) => {
  const { user, profile } = useAuth();
  const { createOrderSupportConversation, sendMessage } = useChat();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [firstMessage, setFirstMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const isSeller = profile?.role === "seller";
  const buyerId = order.user_id;
  const productId = order.product_id;

  useEffect(() => {
    let mounted = true;
    const loadExisting = async () => {
      try {
        // Priority: check by order_id + order_support
        const { data: byOrder } = await supabase
          .from('conversations')
          .select('id')
          .eq('buyer_id', buyerId)
          .eq('seller_id', sellerId)
          .eq('order_id', order.id)
          .eq('chat_type', 'order_support')
          .maybeSingle();

        if (byOrder?.id && mounted) {
          setConversationId(byOrder.id);
          setLoading(false);
          return;
        }

        // Fallback: check by (buyer, seller, product) any chat_type
        const { data: byProduct } = await supabase
          .from('conversations')
          .select('id, chat_type, order_id')
          .eq('buyer_id', buyerId)
          .eq('seller_id', sellerId)
          .eq('product_id', productId)
          .order('last_message_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (byProduct?.id && mounted) {
          setConversationId(byProduct.id);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadExisting();
    return () => { mounted = false; };
  }, [buyerId, sellerId, order.id, productId]);

  const handleSendFirst = async () => {
    if (!firstMessage.trim() || !user) return;
    try {
      setSending(true);
      // Only buyers can create new conversations per RLS
      if (isSeller) return;

      const convId = await createOrderSupportConversation(order.id, sellerId);
      setConversationId(convId);

      await sendMessage(convId, firstMessage);
      setFirstMessage("");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <div className="text-sm text-muted-foreground">Đang tải khung chat…</div>;
  }

  if (conversationId) {
    return (
      <div className="border rounded-md overflow-hidden" style={{ height }}>
        <CompactChatWindow conversationId={conversationId} />
      </div>
    );
  }

  // No conversation yet
  return (
    <div className="space-y-2">
      <div className="text-sm text-muted-foreground">
        Chưa có cuộc trò chuyện cho đơn hàng này. {isSeller ? 'Khách hàng cần gửi tin nhắn đầu tiên.' : 'Hãy gửi tin nhắn để bắt đầu trao đổi.'}
      </div>

      <div className="flex gap-2">
        <Input
          value={firstMessage}
          onChange={(e) => setFirstMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !isSeller && handleSendFirst()}
          placeholder={isSeller ? "Chờ khách hàng khởi tạo chat…" : "Nhập tin nhắn đầu tiên…"}
          disabled={isSeller || sending}
        />
        <Button onClick={handleSendFirst} disabled={isSeller || sending || !firstMessage.trim()}>
          Gửi
        </Button>
      </div>
    </div>
  );
};

export default OrderInlineChat;
