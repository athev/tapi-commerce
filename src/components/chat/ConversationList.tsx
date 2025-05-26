
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useChat, Conversation } from "@/hooks/useChat";
import { useAuth } from "@/context/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

interface ConversationListProps {
  onConversationSelect: (conversationId: string) => void;
  selectedConversationId?: string;
}

const ConversationList = ({ onConversationSelect, selectedConversationId }: ConversationListProps) => {
  const { conversations, loading } = useChat();
  const { user, profile } = useAuth();

  console.log('ConversationList - Current user:', user?.id);
  console.log('ConversationList - User profile:', profile);
  console.log('ConversationList - Conversations:', conversations);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <p className="text-center text-gray-500">Đang tải...</p>
        </CardContent>
      </Card>
    );
  }

  if (conversations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tin nhắn</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500">Chưa có cuộc trò chuyện nào</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tin nhắn</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-1">
          {conversations.map((conversation: Conversation) => {
            const isBuyer = conversation.buyer_id === user?.id;
            const isSeller = conversation.seller_id === user?.id;
            const unreadCount = isBuyer ? conversation.buyer_unread_count : conversation.seller_unread_count;
            const isSelected = conversation.id === selectedConversationId;
            
            // Get display name and role label
            const displayName = isBuyer 
              ? (conversation.seller_name || conversation.other_user?.full_name || 'Người bán')
              : (conversation.buyer_name || conversation.other_user?.full_name || 'Khách hàng');
            
            const roleLabel = isBuyer ? '(Người bán)' : '(Khách hàng)';
            
            console.log('Conversation display info:', {
              id: conversation.id,
              chat_type: conversation.chat_type,
              isBuyer,
              isSeller,
              displayName,
              roleLabel,
              seller_name: conversation.seller_name,
              buyer_name: conversation.buyer_name,
              other_user: conversation.other_user,
              order: conversation.order,
              product: conversation.product
            });
            
            return (
              <div
                key={conversation.id}
                onClick={() => onConversationSelect(conversation.id)}
                className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                  isSelected ? 'bg-blue-50 border-blue-200' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarFallback>
                      {displayName?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-sm truncate">
                        {displayName}
                        <span className={`text-xs ml-2 ${isBuyer ? 'text-green-600' : 'text-blue-600'}`}>
                          {roleLabel}
                        </span>
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(conversation.last_message_at), { 
                            locale: vi,
                            addSuffix: true 
                          })}
                        </span>
                        {unreadCount > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {/* Chat type indicator */}
                    <div className="flex items-center gap-2 mt-1">
                      {conversation.chat_type === 'order_support' && conversation.order ? (
                        <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                          Hỗ trợ đơn hàng #{conversation.order.id.slice(0, 8)}
                        </span>
                      ) : (
                        <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          Tư vấn sản phẩm
                        </span>
                      )}
                    </div>
                    
                    {conversation.product && (
                      <p className="text-xs text-gray-600 truncate mt-1">
                        Sản phẩm: {conversation.product.title}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ConversationList;
