
import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useChat } from "@/hooks/useChat";
import { useToast } from "@/hooks/use-toast";
import ChatConfirmationModal from "./ChatConfirmationModal";

interface Product {
  id: string;
  title: string;
  image?: string;
  price: number;
  seller_name: string;
  seller_id: string;
  product_type?: string;
}

interface ChatButtonProps {
  product: Product;
  orderId?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
}

const ChatButton = ({ 
  product, 
  orderId,
  variant = "outline",
  size = "sm",
  className = ""
}: ChatButtonProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { createOrGetConversation } = useChat();
  const { toast } = useToast();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChatClick = () => {
    if (!user) {
      toast({
        title: "Cần đăng nhập",
        description: "Vui lòng đăng nhập để chat với người bán",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }

    if (user.id === product.seller_id) {
      toast({
        title: "Không thể chat",
        description: "Bạn không thể chat với chính mình",
        variant: "destructive"
      });
      return;
    }

    // If there's an order ID, go directly to chat (order support)
    if (orderId) {
      handleConfirmChat();
    } else {
      // Show confirmation modal for product consultation
      setShowConfirmModal(true);
    }
  };

  const handleConfirmChat = async () => {
    try {
      setIsLoading(true);
      
      console.log('Creating/getting conversation for:', {
        productId: product.id,
        sellerId: product.seller_id,
        orderId,
        userId: user?.id
      });

      const conversationId = await createOrGetConversation(
        product.seller_id, 
        product.id,
        orderId,
        orderId ? 'order_support' : 'product_consultation'
      );
      
      console.log('Conversation created/found:', conversationId);
      
      setShowConfirmModal(false);
      
      // Navigate to chat with a slight delay to ensure conversation is created
      setTimeout(() => {
        navigate(`/chat/${conversationId}`);
      }, 100);
      
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tạo cuộc trò chuyện",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleChatClick}
        disabled={isLoading}
        className={className}
      >
        <MessageCircle className="h-4 w-4 mr-2" />
        {isLoading 
          ? "Đang tạo..." 
          : (orderId ? "Chat hỗ trợ đơn hàng" : "Chat với người bán")
        }
      </Button>

      <ChatConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmChat}
        product={product}
      />
    </>
  );
};

export default ChatButton;
