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
  const [isOrderInfoExpanded, setIsOrderInfoExpanded] = useState(true);
  const [isProductInfoExpanded, setIsProductInfoExpanded] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
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
    <div className="h-[calc(100vh-120px)] flex flex-col bg-white rounded-lg border shadow-sm">
      {/* Header */}
      <div className="flex-shrink-0 border-b p-4">
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
            <h3 className="text-lg font-semibold">
              {headerDisplayName}
              {isBuyer && <span className="text-sm font-normal text-green-600 ml-2">(Cửa hàng)</span>}
              {!isBuyer && <span className="text-sm font-normal text-blue-600 ml-2">(Khách hàng)</span>}
            </h3>
            
            {currentConversation.chat_type === 'order_support' && currentConversation.order && (
              <div className="flex items-center gap-2">
                <p className="text-sm text-orange-600">
                  Chat hỗ trợ đơn hàng #{currentConversation.order.id.slice(0, 8)}
                </p>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate(`/my-purchases`)}
                  className="text-xs p-1 h-auto"
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            )}
            
            {currentConversation.chat_type === 'product_consultation' && (
              <div className="space-y-1">
                {currentProduct && (
                  <p className="text-sm text-gray-600">
                    Đang tư vấn: {currentProduct.title}
                    {productId && currentProduct.id === productId && (
                      <span className="text-blue-600 ml-2 font-medium">⭐ Hiện tại</span>
                    )}
                  </p>
                )}
                {relatedProducts.length > 0 && (
                  <p className="text-xs text-blue-500">
                    +{relatedProducts.length} sản phẩm khác đã thảo luận
                  </p>
                )}
                {currentConversation.related_orders && currentConversation.related_orders.length > 0 && (
                  <p className="text-xs text-orange-500">
                    {currentConversation.related_orders.length} đơn hàng đã mua
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Area with Internal Scroll */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Info Cards with Collapsible */}
        <div className="flex-shrink-0 border-b bg-gray-50 max-h-80 overflow-y-auto">
          {/* Order Management for Sellers */}
          {currentConversation.chat_type === 'order_support' && currentConversation.order && isSeller && (
            <Collapsible open={isOrderInfoExpanded} onOpenChange={setIsOrderInfoExpanded}>
              <div className="p-4">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                    <div className="flex items-center gap-2">
                      <Package2 className="h-4 w-4 text-orange-600" />
                      <span className="font-medium">Quản lý đơn hàng #{currentConversation.order.id.slice(0, 8)}</span>
                    </div>
                    {isOrderInfoExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2">
                  <OrderManagementActions 
                    order={currentConversation.order} 
                    onStatusUpdate={() => fetchConversations()}
                  />
                </CollapsibleContent>
              </div>
            </Collapsible>
          )}

          {/* Order Info Card for Buyers */}
          {currentConversation.chat_type === 'order_support' && currentConversation.order && isBuyer && (
            <Collapsible open={isOrderInfoExpanded} onOpenChange={setIsOrderInfoExpanded}>
              <div className="p-4">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                    <div className="flex items-center gap-2">
                      <Package2 className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">Thông tin đơn hàng #{currentConversation.order.id.slice(0, 8)}</span>
                    </div>
                    {isOrderInfoExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2">
                  <OrderInfoCard order={currentConversation.order} />
                </CollapsibleContent>
              </div>
            </Collapsible>
          )}

          {/* Product Info Card */}
          {currentConversation.chat_type === 'product_consultation' && currentProduct && (
            <Collapsible open={isProductInfoExpanded} onOpenChange={setIsProductInfoExpanded}>
              <div className="p-4">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                    <div className="flex items-center gap-2">
                      <Package2 className="h-4 w-4 text-green-600" />
                      <span className="font-medium">Thông tin sản phẩm</span>
                      {productId && currentProduct.id === productId && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Đang tư vấn</span>
                      )}
                    </div>
                    {isProductInfoExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2">
                  <ProductInfoCard product={currentProduct} />
                  
                  {relatedProducts.length > 0 && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Sản phẩm khác đã thảo luận ({relatedProducts.length})
                      </h4>
                      <div className="space-y-1">
                        {relatedProducts.slice(0, 3).map(product => (
                          <p key={product.id} className="text-xs text-gray-600">
                            • {product.title}
                          </p>
                        ))}
                        {relatedProducts.length > 3 && (
                          <p className="text-xs text-gray-500">
                            ... và {relatedProducts.length - 3} sản phẩm khác
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {currentConversation.related_orders && currentConversation.related_orders.length > 0 && (
                    <div className="mt-3 p-3 bg-orange-50 rounded-lg">
                      <h4 className="text-sm font-medium text-orange-800 mb-2">
                        Đơn hàng đã mua ({currentConversation.related_orders.length})
                      </h4>
                      <div className="space-y-1">
                        {currentConversation.related_orders.slice(0, 3).map(order => (
                          <p key={order.id} className="text-xs text-orange-600">
                            • #{order.id.slice(0, 8)} - {order.status} - {order.products?.title}
                          </p>
                        ))}
                        {currentConversation.related_orders.length > 3 && (
                          <p className="text-xs text-orange-500">
                            ... và {currentConversation.related_orders.length - 3} đơn khác
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </CollapsibleContent>
              </div>
            </Collapsible>
          )}
        </div>

        {/* Messages Area with Internal Scroll */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
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
        </ScrollArea>

        {/* Message Input */}
        <div className="flex-shrink-0 border-t p-4">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              title="Gửi hình ảnh"
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
      </div>
    </div>
  );
};

export default ChatWindow;
