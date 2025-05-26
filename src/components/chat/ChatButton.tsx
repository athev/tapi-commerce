
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useChat } from "@/hooks/useChat";
import { useToast } from "@/hooks/use-toast";

interface ChatButtonProps {
  sellerId: string;
  productId?: string;
  productTitle?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
}

const ChatButton = ({ 
  sellerId, 
  productId, 
  productTitle,
  variant = "outline",
  size = "sm",
  className = ""
}: ChatButtonProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { createOrGetConversation } = useChat();
  const { toast } = useToast();

  const handleChatClick = async () => {
    if (!user) {
      toast({
        title: "Cần đăng nhập",
        description: "Vui lòng đăng nhập để chat với người bán",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }

    if (user.id === sellerId) {
      toast({
        title: "Không thể chat",
        description: "Bạn không thể chat với chính mình",
        variant: "destructive"
      });
      return;
    }

    try {
      const conversationId = await createOrGetConversation(sellerId, productId);
      navigate(`/chat/${conversationId}`);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tạo cuộc trò chuyện",
        variant: "destructive"
      });
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleChatClick}
      className={className}
    >
      <MessageCircle className="h-4 w-4 mr-2" />
      Chat với người bán
    </Button>
  );
};

export default ChatButton;
