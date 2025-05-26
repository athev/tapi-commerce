
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Image, ArrowLeft } from "lucide-react";
import { useChat, Message } from "@/hooks/useChat";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import QuickQuestions from "./QuickQuestions";
import OrderInfoCard from "./OrderInfoCard";
import ProductInfoCard from "./ProductInfoCard";

interface ChatWindowProps {
  conversationId: string;
}

const ChatWindow = ({ conversationId }: ChatWindowProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [newMessage, setNewMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { 
    messages, 
    conversations, 
    sendMessage, 
    uploadImage,
    setCurrentConversation 
  } = useChat();

  const currentConversation = conversations.find(c => c.id === conversationId);

  useEffect(() => {
    setCurrentConversation(conversationId);
  }, [conversationId, setCurrentConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    await sendMessage(conversationId, newMessage);
    setNewMessage("");
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const imageUrl = await uploadImage(file);
      await sendMessage(conversationId, "Đã gửi một hình ảnh", "image", imageUrl);
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuestionSelect = (question: string) => {
    setNewMessage(question);
  };

  if (!currentConversation) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <p className="text-gray-500">Cuộc trò chuyện không tồn tại</p>
        </CardContent>
      </Card>
    );
  }

  const isBuyer = currentConversation.buyer_id === user?.id;
  const headerDisplayName = isBuyer 
    ? (currentConversation.seller_name || 'Người bán')
    : (currentConversation.buyer_name || 'Khách hàng');

  console.log('ChatWindow - Current conversation:', currentConversation);
  console.log('ChatWindow - User role:', isBuyer ? 'buyer' : 'seller');
  console.log('ChatWindow - Header display name:', headerDisplayName);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="border-b">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/chat')}
            className="md:hidden"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          <Avatar>
            <AvatarFallback>
              {headerDisplayName?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <CardTitle className="text-lg">
              {headerDisplayName}
              {isBuyer && <span className="text-sm font-normal text-green-600 ml-2">(Cửa hàng)</span>}
              {!isBuyer && <span className="text-sm font-normal text-blue-600 ml-2">(Khách hàng)</span>}
            </CardTitle>
            {currentConversation.product && (
              <p className="text-sm text-gray-600">
                Sản phẩm: {currentConversation.product.title}
              </p>
            )}
            {currentConversation.chat_type === 'order_support' && currentConversation.order && (
              <p className="text-sm text-orange-600">
                Chat hỗ trợ đơn hàng #{currentConversation.order.id.slice(0, 8)}
              </p>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Order Info Card for order support chats */}
        {currentConversation.chat_type === 'order_support' && currentConversation.order && (
          <div className="p-4 border-b bg-gray-50">
            <OrderInfoCard order={currentConversation.order} />
          </div>
        )}

        {/* Product Info Card for product consultation chats */}
        {currentConversation.chat_type === 'product_consultation' && currentConversation.product && (
          <div className="p-4 border-b bg-gray-50">
            <ProductInfoCard product={currentConversation.product} />
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Quick Questions - only show at the beginning of product consultation */}
          {currentConversation.chat_type === 'product_consultation' && messages.length === 0 && (
            <QuickQuestions 
              onQuestionSelect={handleQuestionSelect}
              productType={currentConversation.product?.product_type}
            />
          )}

          {messages.map((message: Message) => {
            const isOwn = message.sender_id === user?.id;
            const senderDisplayName = message.sender_name || 'Người dùng';
            
            console.log('Message display info:', {
              id: message.id,
              isOwn,
              sender_id: message.sender_id,
              sender_name: message.sender_name,
              sender_role: message.sender_role,
              senderDisplayName
            });
            
            return (
              <div
                key={message.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-2' : 'order-1'}`}>
                  <div
                    className={`rounded-lg px-4 py-2 ${
                      isOwn
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    {message.message_type === 'image' && message.image_url ? (
                      <img
                        src={message.image_url}
                        alt="Sent image"
                        className="max-w-full rounded"
                      />
                    ) : (
                      <p className="text-sm">{message.content}</p>
                    )}
                  </div>
                  <div className={`text-xs text-gray-500 mt-1 flex ${isOwn ? 'justify-end' : 'justify-start'} items-center gap-2`}>
                    <span className="font-medium">
                      {isOwn ? 'Bạn' : senderDisplayName}
                      {!isOwn && message.sender_role === 'seller' && <span className="text-green-600 ml-1">(Cửa hàng)</span>}
                      {!isOwn && message.sender_role !== 'seller' && <span className="text-blue-600 ml-1">(Khách hàng)</span>}
                    </span>
                    <span>•</span>
                    <span>
                      {formatDistanceToNow(new Date(message.created_at), { 
                        addSuffix: true, 
                        locale: vi 
                      })}
                    </span>
                  </div>
                </div>
                
                {!isOwn && (
                  <Avatar className="order-0 mr-2">
                    <AvatarFallback className="text-xs">
                      {senderDisplayName?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="border-t p-4">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <Image className="h-4 w-4" />
            </Button>
            
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Nhập tin nhắn..."
              className="flex-1"
            />
            
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || isUploading}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatWindow;
