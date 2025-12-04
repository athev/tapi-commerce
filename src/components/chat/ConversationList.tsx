import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Package } from "lucide-react";
import { useChat, Conversation } from "@/hooks/useChat";
import { useAuth } from "@/context/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import ChatEmptyState from "@/components/chat/ChatEmptyState";

interface ConversationListProps {
  onConversationSelect: (id: string) => void;
  selectedConversationId?: string;
}

const ConversationList = ({ onConversationSelect, selectedConversationId }: ConversationListProps) => {
  const { user } = useAuth();
  const { conversations, loading } = useChat();

  const getUnreadCount = (conversation: Conversation) => {
    const isBuyer = conversation.buyer_id === user?.id;
    return isBuyer ? conversation.buyer_unread_count : conversation.seller_unread_count;
  };

  const getDisplayName = (conversation: Conversation) => {
    const isBuyer = conversation.buyer_id === user?.id;
    return isBuyer 
      ? (conversation.seller_name || 'Người bán')
      : (conversation.buyer_name || 'Khách hàng');
  };

  const getChatTypeInfo = (conversation: Conversation) => {
    if (conversation.chat_type === 'order_support') {
      return {
        icon: <Package className="h-3 w-3" />,
        label: `Đơn hàng #${conversation.order?.id.slice(0, 8)}`,
        color: 'bg-orange-100 text-orange-800'
      };
    } else if (conversation.chat_type === 'service_request') {
      return {
        icon: <Package className="h-3 w-3" />,
        label: 'Yêu cầu dịch vụ',
        color: 'bg-purple-100 text-purple-800'
      };
    } else {
      return {
        icon: <MessageCircle className="h-3 w-3" />,
        label: 'Tư vấn sản phẩm',
        color: 'bg-blue-100 text-blue-800'
      };
    }
  };

  const getOrderStatus = (status: string) => {
    const statusMap = {
      'pending': { label: 'Chờ thanh toán', color: 'bg-yellow-100 text-yellow-800' },
      'paid': { label: 'Đã thanh toán', color: 'bg-green-100 text-green-800' },
      'cancelled': { label: 'Đã hủy', color: 'bg-red-100 text-red-800' },
    };
    return statusMap[status as keyof typeof statusMap] || { label: status, color: 'bg-gray-100 text-gray-800' };
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b">
          <h2 className="font-semibold flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Tin nhắn
          </h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header - Hidden on mobile since we have it in parent */}
      <div className="hidden lg:block p-4 border-b">
        <h2 className="font-semibold flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Tin nhắn ({conversations.length})
        </h2>
      </div>
      
      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-6">
            <ChatEmptyState type="no-conversations" />
          </div>
        ) : (
          <div className="divide-y divide-border">
            {conversations.map((conversation) => {
              const unreadCount = getUnreadCount(conversation);
              const displayName = getDisplayName(conversation);
              const chatTypeInfo = getChatTypeInfo(conversation);
              const isSelected = selectedConversationId === conversation.id;
              
              return (
                <div
                  key={conversation.id}
                  onClick={() => onConversationSelect(conversation.id)}
                  className={`
                    p-3 cursor-pointer transition-colors
                    ${isSelected 
                      ? 'bg-primary/10 border-l-4 border-l-primary' 
                      : 'hover:bg-muted/50'
                    }
                  `}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-12 w-12 flex-shrink-0">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {displayName?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className={`font-medium truncate ${unreadCount > 0 ? 'text-foreground' : 'text-foreground/80'}`}>
                          {displayName}
                        </h3>
                        {unreadCount > 0 && (
                          <Badge className="bg-primary text-primary-foreground text-xs px-2 py-0.5">
                            {unreadCount}
                          </Badge>
                        )}
                      </div>
                      
                      {/* Chat type badge */}
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className={`text-xs ${chatTypeInfo.color}`}>
                          {chatTypeInfo.icon}
                          <span className="ml-1">{chatTypeInfo.label}</span>
                        </Badge>
                        
                        {conversation.chat_type === 'order_support' && conversation.order && (
                          <Badge variant="secondary" className={`text-xs ${getOrderStatus(conversation.order.status).color}`}>
                            {getOrderStatus(conversation.order.status).label}
                          </Badge>
                        )}
                      </div>
                      
                      {/* Product info */}
                      {conversation.product && (
                        <p className="text-sm text-muted-foreground truncate mt-1">
                          {conversation.product.title}
                        </p>
                      )}
                      
                      {/* Time */}
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(conversation.last_message_at), { 
                          addSuffix: true, 
                          locale: vi 
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationList;
