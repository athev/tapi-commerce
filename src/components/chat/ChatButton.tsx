
import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useChat } from "@/hooks/useChat";
import { useToast } from "@/hooks/use-toast";
import { findValidConversation, updateConversationProduct } from "@/hooks/chat/conversationService";
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
  const { createOrGetConversation, fetchConversations } = useChat();
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

      const chatType = orderId ? 'order_support' : 'product_consultation';
      
      // First, try to find an existing valid conversation
      const existingConversationId = await findValidConversation(
        user!.id,
        product.seller_id,
        chatType
      );

      let conversationId: string;
      
      if (existingConversationId && chatType === 'product_consultation') {
        console.log('Using existing conversation and updating product context:', existingConversationId);
        conversationId = existingConversationId;
        
        // Update the conversation to reflect the current product being discussed
        await updateConversationProduct(conversationId, product.id);
      } else if (existingConversationId) {
        console.log('Using existing conversation:', existingConversationId);
        conversationId = existingConversationId;
      } else {
        console.log('Creating new conversation');
        conversationId = await createOrGetConversation(
          product.seller_id, 
          product.id,
          orderId,
          chatType
        );
      }
      
      console.log('Final conversation ID:', conversationId);
      
      // Refresh conversations to ensure the list is updated
      await fetchConversations();
      
      setShowConfirmModal(false);
      
      // Navigate directly to chat
      navigate(`/chat/${conversationId}`);
      
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
