
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Package, ShoppingCart } from "lucide-react";
import { useChat, Conversation } from "@/hooks/useChat";
import { useAuth } from "@/context/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

interface ConversationListProps {
  onConversationSelect: (id: string) => void;
  selectedConversationId?: string;
}

import ChatEmptyState from "@/components/chat/ChatEmptyState";

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
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Tin nhắn
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Đang tải...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="shrink-0">
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Tin nhắn ({conversations.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-6">
            <ChatEmptyState type="no-conversations" />
          </div>
        ) : (
          <div className="space-y-0">
            {conversations.map((conversation) => {
              const unreadCount = getUnreadCount(conversation);
              const displayName = getDisplayName(conversation);
              const chatTypeInfo = getChatTypeInfo(conversation);
              
              return (
                <div
                  key={conversation.id}
                  onClick={() => onConversationSelect(conversation.id)}
                  className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedConversationId === conversation.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <Avatar className="mt-1">
                      <AvatarFallback>
                        {displayName?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium truncate">
                          {displayName}
                          {conversation.buyer_id !== user?.id && 
                            <span className="text-sm font-normal text-green-600 ml-2">(Cửa hàng)</span>
                          }
                          {conversation.buyer_id === user?.id && 
                            <span className="text-sm font-normal text-blue-600 ml-2">(Khách hàng)</span>
                          }
                        </h3>
                        {unreadCount > 0 && (
                          <Badge variant="destructive" className="ml-2">
                            {unreadCount}
                          </Badge>
                        )}
                      </div>
                      
                      {/* Chat type and status */}
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className={`text-xs ${chatTypeInfo.color}`}>
                          {chatTypeInfo.icon}
                          <span className="ml-1">{chatTypeInfo.label}</span>
                        </Badge>
                        
                        {conversation.chat_type === 'order_support' && conversation.order && (
                          <Badge variant="outline" className={`text-xs ${getOrderStatus(conversation.order.status).color}`}>
                            {getOrderStatus(conversation.order.status).label}
                          </Badge>
                        )}
                      </div>
                      
                      {/* Product/Order info */}
                      {conversation.product && (
                        <p className="text-sm text-gray-600 truncate mb-1">
                          {conversation.chat_type === 'order_support' ? '📦 ' : '💬 '}
                          {conversation.product.title}
                        </p>
                      )}
                      
                      {/* Related items summary */}
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        {conversation.related_products && conversation.related_products.length > 0 && (
                          <span>+{conversation.related_products.length} sản phẩm</span>
                        )}
                        {conversation.related_orders && conversation.related_orders.length > 0 && (
                          <span>+{conversation.related_orders.length} đơn hàng</span>
                        )}
                      </div>
                      
                      <p className="text-xs text-gray-500 mt-1">
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
      </CardContent>
    </Card>
  );
};

export default ConversationList;
