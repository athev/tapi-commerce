import { MessageCircle, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface ChatEmptyStateProps {
  type?: 'no-conversations' | 'no-selection';
}

const ChatEmptyState = ({ type = 'no-conversations' }: ChatEmptyStateProps) => {
  const navigate = useNavigate();

  if (type === 'no-selection') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <MessageCircle className="h-16 w-16 text-gray-300 mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          Chọn cuộc trò chuyện
        </h3>
        <p className="text-gray-500 max-w-md">
          Chọn một cuộc trò chuyện từ danh sách bên trái để bắt đầu nhắn tin
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="relative mb-6">
        <MessageCircle className="h-20 w-20 text-gray-200" />
        <Package className="h-10 w-10 text-gray-300 absolute -bottom-2 -right-2" />
      </div>
      <h3 className="text-xl font-semibold text-gray-700 mb-2">
        Chưa có tin nhắn nào
      </h3>
      <p className="text-gray-500 max-w-md mb-6">
        Hãy chat với người bán để được tư vấn sản phẩm hoặc theo dõi đơn hàng của bạn
      </p>
      <Button 
        onClick={() => navigate('/')}
        className="gap-2"
      >
        <Package className="h-4 w-4" />
        Khám phá sản phẩm
      </Button>
    </div>
  );
};

export default ChatEmptyState;
