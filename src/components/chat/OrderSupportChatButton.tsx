
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useChat } from "@/hooks/useChat";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface Order {
  id: string;
  status: string;
  created_at: string;
  delivery_status?: string;
  products?: {
    title: string;
    price: number;
    seller_id?: string;
  };
  user_id: string;
}

interface OrderSupportChatButtonProps {
  order: Order;
  sellerId: string;
  className?: string;
  variant?: "default" | "outline" | "ghost";
}

const OrderSupportChatButton = ({ 
  order, 
  sellerId, 
  className = "", 
  variant = "outline" 
}: OrderSupportChatButtonProps) => {
  const { user } = useAuth();
  const { createOrderSupportConversation } = useChat();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleOrderSupportChat = async () => {
    if (!user) {
      toast({
        title: "Cần đăng nhập",
        description: "Vui lòng đăng nhập để chat hỗ trợ đơn hàng",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      
      console.log('Creating order support conversation:', {
        orderId: order.id,
        sellerId,
        buyerId: user.id
      });

      const conversationId = await createOrderSupportConversation(order.id, sellerId);
      
      console.log('Order support conversation created:', conversationId);
      
      navigate(`/chat/${conversationId}`);
      
      toast({
        title: "Chat hỗ trợ",
        description: "Đã tạo cuộc trò chuyện hỗ trợ đơn hàng",
        variant: "default"
      });
    } catch (error) {
      console.error('Error creating order support conversation:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tạo cuộc trò chuyện hỗ trợ",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      onClick={handleOrderSupportChat}
      disabled={isLoading}
      className={className}
    >
      <MessageCircle className="h-4 w-4 mr-2" />
      {isLoading ? "Đang tạo..." : "Chat hỗ trợ đơn hàng"}
    </Button>
  );
};

export default OrderSupportChatButton;
