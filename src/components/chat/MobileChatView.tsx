import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Plus, X, Smile } from "lucide-react";
import { useChat, Message } from "@/hooks/useChat";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import MobileChatHeader from "./MobileChatHeader";
import ProductCardInChat from "./ProductCardInChat";
import ChatActionPanel from "./ChatActionPanel";
import ProductsBottomSheet from "./ProductsBottomSheet";
import VouchersBottomSheet from "./VouchersBottomSheet";
import QuickBuyModal from "./QuickBuyModal";
import ServiceQuoteMessage from "./ServiceQuoteMessage";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

interface MobileChatViewProps {
  conversationId: string;
  onBack: () => void;
}

const MobileChatView = ({ conversationId, onBack }: MobileChatViewProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [newMessage, setNewMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionPanelOpen, setIsActionPanelOpen] = useState(false);
  const [showProductsSheet, setShowProductsSheet] = useState(false);
  const [showVouchersSheet, setShowVouchersSheet] = useState(false);
  const [showQuickBuyModal, setShowQuickBuyModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState("");
  const [serviceTicket, setServiceTicket] = useState<any>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
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
    const findConversation = async () => {
      const conv = conversations.find(c => c.id === conversationId);
      if (conv) {
        setCurrentConv(conv);
        setIsLoading(false);
      } else {
        await fetchConversations();
        const refreshedConv = conversations.find(c => c.id === conversationId);
        if (refreshedConv) {
          setCurrentConv(refreshedConv);
        }
        setIsLoading(false);
      }
    };

    if (conversationId && user) {
      if (conversations.length > 0) {
        findConversation();
      } else {
        fetchConversations();
      }
    }
  }, [conversationId, conversations, fetchConversations, user]);

  useEffect(() => {
    setCurrentConversation(conversationId);
  }, [conversationId, setCurrentConversation]);

  // Fetch service ticket
  useEffect(() => {
    const fetchServiceTicket = async () => {
      if (currentConversation?.chat_type === 'service_request') {
        const { data } = await supabase
          .from('service_tickets')
          .select('*')
          .eq('conversation_id', conversationId)
          .maybeSingle();
        setServiceTicket(data);
      }
    };
    if (currentConversation) fetchServiceTicket();
  }, [currentConversation, conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSending) return;
    
    setIsSending(true);
    try {
      await sendMessage(conversationId, newMessage);
      setNewMessage("");
      setIsActionPanelOpen(false);
      inputRef.current?.focus();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const imageUrl = await uploadImage(file);
      await sendMessage(conversationId, "Đã gửi một hình ảnh", "image", imageUrl);
      setIsActionPanelOpen(false);
    } catch (error: any) {
      toast({
        title: "Không thể gửi hình ảnh",
        description: error?.message || "Vui lòng thử lại sau",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickBuy = (product?: any) => {
    setSelectedProduct(product || currentProduct);
    setShowQuickBuyModal(true);
    setShowProductsSheet(false);
  };

  const handleAcceptQuote = async () => {
    if (!serviceTicket) return;
    try {
      const { data, error } = await supabase.functions.invoke('accept-service-quote', {
        body: { ticketId: serviceTicket.id }
      });
      if (error) throw error;
      toast({ title: "Đã chấp nhận báo giá" });
      if (data?.orderId) navigate(`/payment/${data.orderId}`);
    } catch (error: any) {
      toast({ title: "Có lỗi xảy ra", description: error.message, variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Đang tải...</p>
      </div>
    );
  }

  if (!currentConversation) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-background p-4">
        <p className="text-muted-foreground mb-4">Cuộc trò chuyện không tồn tại</p>
        <Button onClick={onBack} variant="outline">Quay lại</Button>
      </div>
    );
  }

  const isBuyer = currentConversation.buyer_id === user?.id;
  const sellerName = currentConversation.seller_name || 'Người bán';
  const buyerName = currentConversation.buyer_name || 'Khách hàng';
  const displayName = isBuyer ? sellerName : buyerName;
  const sellerId = currentConversation.seller_id;
  
  const currentProduct = currentConversation.product || 
    (currentConversation.related_products?.[0]);

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Mobile Header */}
      <MobileChatHeader
        sellerName={displayName}
        shopName={isBuyer ? sellerName : undefined}
        onBack={onBack}
        isOnline={true}
      />

      {/* Product Card */}
      {currentProduct && isBuyer && (
        <ProductCardInChat 
          product={currentProduct} 
          onBuyNow={() => handleQuickBuy(currentProduct)}
        />
      )}

      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-3">
            {messages.map((message: Message) => {
              const isOwn = message.sender_id === user?.id;
              
              if (message.message_type === 'service_quote') {
                try {
                  const quoteData = JSON.parse(message.content);
                  return (
                    <div key={message.id} className="my-4">
                      <ServiceQuoteMessage
                        quoteData={quoteData}
                        userRole={isBuyer ? 'buyer' : 'seller'}
                        ticketStatus={serviceTicket?.status || 'pending'}
                        onAccept={handleAcceptQuote}
                      />
                    </div>
                  );
                } catch (e) {}
              }
              
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'} gap-2`}
                >
                  {!isOwn && (
                    <Avatar className="h-8 w-8 mt-1 shrink-0">
                      <AvatarFallback className="text-xs bg-primary/10">
                        {displayName?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div className="max-w-[80%]">
                    <div
                      className={`rounded-2xl px-4 py-2.5 ${
                        isOwn
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground'
                      }`}
                    >
                      {message.message_type === 'image' && message.image_url ? (
                        <img
                          src={message.image_url}
                          alt="Sent image"
                          className="max-w-full rounded-lg cursor-pointer"
                          onClick={() => {
                            setLightboxImage(message.image_url!);
                            setLightboxOpen(true);
                          }}
                        />
                      ) : (
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {message.content}
                        </p>
                      )}
                    </div>
                    <p className={`text-[10px] text-muted-foreground mt-1 px-2 ${isOwn ? 'text-right' : 'text-left'}`}>
                      {formatDistanceToNow(new Date(message.created_at), { addSuffix: true, locale: vi })}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Action Panel */}
      {isActionPanelOpen && (
        <ChatActionPanel
          onOpenGallery={() => fileInputRef.current?.click()}
          onOpenCamera={() => fileInputRef.current?.click()}
          onOpenProducts={() => setShowProductsSheet(true)}
          onOpenVouchers={() => setShowVouchersSheet(true)}
          onQuickBuy={() => handleQuickBuy()}
          hasCurrentProduct={!!currentProduct && isBuyer}
        />
      )}

      {/* Message Input */}
      <div className="flex-shrink-0 border-t bg-background p-2 safe-area-inset-bottom">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsActionPanelOpen(!isActionPanelOpen)}
            className="shrink-0"
          >
            {isActionPanelOpen ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
          </Button>
          
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Gửi tin nhắn ..."
              disabled={isSending}
              className="pr-10 rounded-full bg-muted border-0"
              onFocus={() => setIsActionPanelOpen(false)}
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
            >
              <Smile className="h-5 w-5 text-muted-foreground" />
            </Button>
          </div>
          
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || isSending}
            size="icon"
            className="shrink-0 rounded-full"
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

      {/* Bottom Sheets & Modals */}
      <ProductsBottomSheet
        isOpen={showProductsSheet}
        onClose={() => setShowProductsSheet(false)}
        sellerId={sellerId}
        shopName={sellerName}
        onSelectProduct={handleQuickBuy}
      />

      <VouchersBottomSheet
        isOpen={showVouchersSheet}
        onClose={() => setShowVouchersSheet(false)}
        sellerId={sellerId}
        shopName={sellerName}
        onSelectVoucher={(voucher) => {
          toast({ title: `Đã lưu voucher: ${voucher.code}` });
          setShowVouchersSheet(false);
        }}
      />

      <QuickBuyModal
        isOpen={showQuickBuyModal}
        onClose={() => setShowQuickBuyModal(false)}
        product={selectedProduct}
      />

      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={[{ src: lightboxImage }]}
      />
    </div>
  );
};

export default MobileChatView;
