
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
  const { user } = useAuth();

  console.log('ConversationList - Current user:', user?.id);
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
            
            console.log('Conversation:', {
              id: conversation.id,
              isBuyer,
              isSeller,
              unreadCount,
              other_user: conversation.other_user
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
                      {conversation.other_user?.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-sm truncate">
                        {conversation.other_user?.full_name || 'Người dùng'}
                        {isSeller && <span className="text-xs text-green-600 ml-2">(Khách hàng)</span>}
                        {isBuyer && <span className="text-xs text-blue-600 ml-2">(Người bán)</span>}
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
