import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Image, ArrowLeft, ExternalLink, ChevronDown, ChevronUp, FileText, Package2 } from "lucide-react";
import { useChat, Message } from "@/hooks/useChat";
import { useAuth } from "@/context/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import QuickQuestions from "./QuickQuestions";
import OrderInfoCard from "./OrderInfoCard";
import ProductInfoCard from "./ProductInfoCard";
import OrderManagementActions from "./OrderManagementActions";

interface ChatWindowProps {
  conversationId: string;
}

const ChatWindow = ({ conversationId }: ChatWindowProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { productId } = useParams();
  const [newMessage, setNewMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCheckedRedirect, setHasCheckedRedirect] = useState(false);
  const [isOrderInfoExpanded, setIsOrderInfoExpanded] = useState(false);
  const [isProductInfoExpanded, setIsProductInfoExpanded] = useState(false);
  const [newMessageIndicator, setNewMessageIndicator] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevMessagesLengthRef = useRef(0);
  
  const { 
    messages, 
    conversations, 
    sendMessage, 
    uploadImage,
    setCurrentConversation,
    fetchConversations 
  } = useChat();

  const [currentConversation, setCurrentConv] = useState<any>(null);

  useEffect(() => {
    const findAndSetConversation = async () => {
      console.log('Looking for conversation:', conversationId);
      console.log('Available conversations:', conversations);
      
      const conv = conversations.find(c => c.id === conversationId);
      if (conv) {
        console.log('Found conversation:', conv);
        setCurrentConv(conv);
        setIsLoading(false);
        setHasCheckedRedirect(true);
      } else {
        console.log('Conversation not found, refreshing...');
        
        if (!hasCheckedRedirect) {
          await fetchConversations();
          
          const refreshedConv = conversations.find(c => c.id === conversationId);
          if (refreshedConv) {
            console.log('Found conversation after refresh:', refreshedConv);
            setCurrentConv(refreshedConv);
            setIsLoading(false);
            setHasCheckedRedirect(true);
          } else {
            console.log('Conversation still not found, looking for alternative...');
            
            const alternativeConv = conversations.find(c => {
              return c.buyer_id === user?.id || c.seller_id === user?.id;
            });
            
            if (alternativeConv) {
              console.log('Found alternative conversation, redirecting:', alternativeConv.id);
              navigate(`/chat/${alternativeConv.id}`, { replace: true });
              return;
            }
            
            console.log('No alternative conversation found');
            setIsLoading(false);
            setHasCheckedRedirect(true);
          }
        } else {
          setIsLoading(false);
        }
      }
    };

    if (conversationId && user) {
      if (conversations.length > 0) {
        findAndSetConversation();
      } else {
        fetchConversations();
      }
    }
  }, [conversationId, conversations, fetchConversations, user, navigate, hasCheckedRedirect]);

  useEffect(() => {
    setCurrentConversation(conversationId);
  }, [conversationId, setCurrentConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Show mini indicator for new messages from others while viewing chat
  useEffect(() => {
    if (messages.length > prevMessagesLengthRef.current) {
      const latestMessage = messages[messages.length - 1];
      
      // Only show indicator if message is from someone else
      if (latestMessage && latestMessage.sender_id !== user?.id) {
        console.log('🔔 [CHAT_WINDOW] New message from other user, showing indicator');
        setNewMessageIndicator(true);
        
        // Play subtle sound
        try {
          const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZSR0OT6Lg7K9aGAg+mNjyxHEqBSJ3x/DdkEAKFF606+uoVRQKRp/g8r5sIQUxh9Hz04IzBh5uwO/jmUkdDk+i4O2vWhgIPpjY8sRxKgUid8fw3ZBAC');
          audio.volume = 0.3;
          audio.play().catch(() => {});
        } catch (e) {
          console.log('Could not play notification sound');
        }
        
        // Auto hide after 3 seconds
        setTimeout(() => setNewMessageIndicator(false), 3000);
      }
    }
    
    prevMessagesLengthRef.current = messages.length;
  }, [messages, user?.id]);

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

  const getCurrentProduct = () => {
    if (!currentConversation) return null;
    
    if (productId) {
      if (currentConversation.product && currentConversation.product.id === productId) {
        console.log('URL product matches conversation main product:', currentConversation.product);
        return currentConversation.product;
      }
      
      if (currentConversation.related_products) {
        const urlProduct = currentConversation.related_products.find(p => p.id === productId);
        if (urlProduct) {
          console.log('Found URL product in related products:', urlProduct);
          return urlProduct;
        }
      }
      
      console.log('URL product not found in conversation context');
    }
    
    if (currentConversation.product) {
      console.log('Using conversation main product as fallback:', currentConversation.product);
      return currentConversation.product;
    }
    
    if (currentConversation.related_products && currentConversation.related_products.length > 0) {
      console.log('Using first related product as last resort:', currentConversation.related_products[0]);
      return currentConversation.related_products[0];
    }
    
    return null;
  };

  const getCurrentRelatedProducts = () => {
    if (!currentConversation || !currentConversation.related_products) return [];
    
    const currentProduct = getCurrentProduct();
    if (!currentProduct) return currentConversation.related_products;
    
    return currentConversation.related_products.filter(p => p.id !== currentProduct.id);
  };

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <p className="text-gray-500">Đang tải cuộc trò chuyện...</p>
        </CardContent>
      </Card>
    );
  }

  if (!currentConversation) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-gray-500 mb-4">Cuộc trò chuyện không tồn tại</p>
            <Button onClick={() => navigate('/chat')} variant="outline">
              Quay lại danh sách chat
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isBuyer = currentConversation.buyer_id === user?.id;
  const isSeller = currentConversation.seller_id === user?.id;
  const headerDisplayName = isBuyer 
    ? (currentConversation.seller_name || 'Người bán')
    : (currentConversation.buyer_name || 'Khách hàng');

  const currentProduct = getCurrentProduct();
  const relatedProducts = getCurrentRelatedProducts();

  console.log('ChatWindow - Current conversation:', currentConversation);
  console.log('ChatWindow - URL productId:', productId);
  console.log('ChatWindow - Current product (from URL priority):', currentProduct);
  console.log('ChatWindow - Related products:', relatedProducts);

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col bg-white rounded-lg border shadow-sm relative">
      {/* New Message Indicator */}
      {newMessageIndicator && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top-2 duration-300">
          <div className="bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>Tin nhắn mới</span>
          </div>
        </div>
      )}
      
      {/* Header - Compact */}
      <div className="flex-shrink-0 border-b p-3">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/chat')}
            className="md:hidden"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-sm">
              {headerDisplayName?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold truncate">
                {headerDisplayName}
              </h3>
              {isBuyer && <span className="text-xs font-normal text-green-600">(Cửa hàng)</span>}
              {!isBuyer && <span className="text-xs font-normal text-blue-600">(Khách hàng)</span>}
            </div>
            
            {currentConversation.chat_type === 'order_support' && currentConversation.order && (
              <div className="flex items-center gap-1 mt-1">
                <span className="text-xs text-orange-600">
                  #{currentConversation.order.id.slice(0, 8)} • {currentConversation.order.status}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate(`/my-purchases`)}
                  className="text-xs p-0 h-auto ml-1"
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            )}
            
            {currentConversation.chat_type === 'product_consultation' && currentProduct && (
              <p className="text-xs text-gray-600 truncate mt-1">
                {currentProduct.title}
                {productId && currentProduct.id === productId && (
                  <span className="text-blue-600 ml-1 font-medium">⭐</span>
                )}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Content Area with Internal Scroll */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Compact Info Cards */}
        <div className="flex-shrink-0 border-b bg-gray-50">
          {/* Order Management for Sellers */}
          {currentConversation.chat_type === 'order_support' && currentConversation.order && isSeller && (
            <div className="p-2">
              <Collapsible open={isOrderInfoExpanded} onOpenChange={setIsOrderInfoExpanded}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between p-2 h-auto text-xs">
                    <div className="flex items-center gap-1">
                      <Package2 className="h-3 w-3 text-orange-600" />
                      <span className="font-medium">Quản lý đơn #{currentConversation.order.id.slice(0, 8)}</span>
                    </div>
                    {isOrderInfoExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <OrderManagementActions 
                    order={currentConversation.order} 
                    onStatusUpdate={() => fetchConversations()}
                  />
                </CollapsibleContent>
              </Collapsible>
            </div>
          )}

          {/* Order Info Card for Buyers */}
          {currentConversation.chat_type === 'order_support' && currentConversation.order && isBuyer && (
            <div className="p-2">
              <Collapsible open={isOrderInfoExpanded} onOpenChange={setIsOrderInfoExpanded}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between p-2 h-auto text-xs">
                    <div className="flex items-center gap-1">
                      <Package2 className="h-3 w-3 text-blue-600" />
                      <span className="font-medium">Đơn hàng #{currentConversation.order.id.slice(0, 8)}</span>
                    </div>
                    {isOrderInfoExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <OrderInfoCard order={currentConversation.order} />
                </CollapsibleContent>
              </Collapsible>
            </div>
          )}

          {/* Product Info Card */}
          {currentConversation.chat_type === 'product_consultation' && currentProduct && (
            <div className="p-2">
              <Collapsible open={isProductInfoExpanded} onOpenChange={setIsProductInfoExpanded}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between p-2 h-auto text-xs">
                    <div className="flex items-center gap-1">
                      <Package2 className="h-3 w-3 text-green-600" />
                      <span className="font-medium">Sản phẩm: {currentProduct.title.slice(0, 30)}...</span>
                      {productId && currentProduct.id === productId && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-1 py-0.5 rounded">Hiện tại</span>
                      )}
                    </div>
                    {isProductInfoExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <ProductInfoCard product={currentProduct} />
                  
                  {relatedProducts.length > 0 && (
                    <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                      <span className="font-medium text-gray-700">
                        +{relatedProducts.length} sản phẩm khác đã thảo luận
                      </span>
                    </div>
                  )}
                </CollapsibleContent>
              </Collapsible>
            </div>
          )}
        </div>

        {/* Messages Area with Fixed Height and Internal Scroll */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
              {currentConversation.chat_type === 'product_consultation' && messages.length === 0 && (
                <QuickQuestions 
                  onQuestionSelect={handleQuestionSelect}
                  productType={currentProduct?.product_type}
                />
              )}

              {messages.map((message: Message) => {
                const isOwn = message.sender_id === user?.id;
                const senderDisplayName = message.sender_name || 'Người dùng';
                
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'} gap-2`}
                  >
                    {!isOwn && (
                      <Avatar className="h-8 w-8 mt-1 flex-shrink-0">
                        <AvatarFallback className="text-xs">
                          {senderDisplayName?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div className={`max-w-[75%] lg:max-w-[65%] ${isOwn ? 'order-2' : 'order-1'}`}>
                      <div
                        className={`rounded-2xl px-4 py-3 break-words ${
                          isOwn
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        {message.message_type === 'image' && message.image_url ? (
                          <img
                            src={message.image_url}
                            alt="Sent image"
                            className="max-w-full rounded-lg"
                          />
                        ) : (
                          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                            {message.content}
                          </p>
                        )}
                      </div>
                      <div className={`text-xs text-gray-500 mt-1 px-2 ${isOwn ? 'text-right' : 'text-left'}`}>
                        <span>
                          {formatDistanceToNow(new Date(message.created_at), { 
                            addSuffix: true, 
                            locale: vi 
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </div>

        {/* Message Input - Fixed at Bottom */}
        <div className="flex-shrink-0 border-t p-3 bg-white">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              title="Gửi hình ảnh"
              className="h-10 w-10 p-0 flex-shrink-0"
            >
              <Image className="h-4 w-4" />
            </Button>
            
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Nhập tin nhắn..."
              className="flex-1 h-10 min-w-0"
            />
            
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || isUploading}
              size="sm"
              className="h-10 w-10 p-0 flex-shrink-0"
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
      </div>
    </div>
  );
};

export default ChatWindow;
