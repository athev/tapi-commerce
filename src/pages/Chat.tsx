import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import ConversationList from "@/components/chat/ConversationList";
import ChatWindow from "@/components/chat/ChatWindow";
import ChatSellerPanel from "@/components/chat/ChatSellerPanel";
import MobileChatView from "@/components/chat/MobileChatView";
import { useAuth } from "@/context/AuthContext";
import { useChat } from "@/hooks/useChat";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import EnhancedNavbar from "@/components/layout/EnhancedNavbar";
import ChatEmptyState from "@/components/chat/ChatEmptyState";

const Chat = () => {
  const { conversationId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { conversations, createOrGetConversation, fetchConversations } = useChat();
  const isMobile = useIsMobile();
  const [selectedConversation, setSelectedConversation] = useState<string | undefined>(conversationId);
  const [isCreatingChat, setIsCreatingChat] = useState(false);

  // Handle seller query param - create conversation when coming from shop page
  useEffect(() => {
    const sellerId = searchParams.get('seller');
    if (sellerId && user && !isCreatingChat) {
      // Don't create chat with yourself
      if (sellerId === user.id) {
        navigate('/chat');
        return;
      }
      
      const createChatWithSeller = async () => {
        setIsCreatingChat(true);
        try {
          console.log('Creating chat with seller from query param:', sellerId);
          const newConversationId = await createOrGetConversation(
            sellerId,
            undefined,
            undefined,
            'product_consultation'
          );
          
          if (newConversationId) {
            await fetchConversations();
            navigate(`/chat/${newConversationId}`, { replace: true });
            setSelectedConversation(newConversationId);
          }
        } catch (error) {
          console.error('Error creating conversation with seller:', error);
          navigate('/chat', { replace: true });
        } finally {
          setIsCreatingChat(false);
        }
      };
      
      createChatWithSeller();
    }
  }, [searchParams, user]);

  // Sync URL param with state
  useEffect(() => {
    if (conversationId) {
      setSelectedConversation(conversationId);
    }
  }, [conversationId]);

  const handleConversationSelect = (id: string) => {
    setSelectedConversation(id);
    navigate(`/chat/${id}`);
  };

  const handleBackToList = () => {
    setSelectedConversation(undefined);
    navigate('/chat');
  };

  // Get current conversation data for seller panel
  const currentConversationData = conversations.find(c => c.id === selectedConversation);
  const isBuyer = currentConversationData?.buyer_id === user?.id;
  const sellerId = isBuyer ? currentConversationData?.seller_id : currentConversationData?.buyer_id;

  if (!user) {
    return (
      <div className="h-screen flex flex-col">
        <EnhancedNavbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageCircle className="h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="text-2xl font-semibold mb-2">
                Cần đăng nhập để chat
              </h2>
              <p className="text-muted-foreground text-center">
                Vui lòng đăng nhập để sử dụng tính năng chat với người bán
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show loading when creating chat from seller param
  if (isCreatingChat) {
    return (
      <div className="h-screen flex flex-col">
        <EnhancedNavbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Đang tạo cuộc trò chuyện...</p>
          </div>
        </div>
      </div>
    );
  }

  // Mobile Layout - Shopee style
  if (isMobile) {
    if (selectedConversation) {
      return (
        <MobileChatView
          conversationId={selectedConversation}
          onBack={handleBackToList}
        />
      );
    }

    return (
      <div className="h-screen flex flex-col bg-background">
        {/* Mobile Header with Back Button */}
        <div className="border-b p-4 flex items-center gap-3 bg-background sticky top-0 z-10">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/')}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <MessageCircle className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-semibold">Tin nhắn</h1>
        </div>
        
        {/* Conversation List */}
        <div className="flex-1 overflow-hidden">
          <ConversationList
            onConversationSelect={handleConversationSelect}
            selectedConversationId={selectedConversation}
          />
        </div>
      </div>
    );
  }

  // Desktop Layout - Facebook Messenger style (3 columns)
  return (
    <div className="h-screen flex flex-col bg-background">
      <EnhancedNavbar />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Conversation List */}
        <div className="w-[320px] xl:w-[360px] border-r border-border flex-shrink-0 bg-background flex flex-col">
          <div className="border-b p-3 flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            <span className="font-semibold">Tin nhắn</span>
          </div>
          <div className="flex-1 overflow-hidden">
            <ConversationList
              onConversationSelect={handleConversationSelect}
              selectedConversationId={selectedConversation}
            />
          </div>
        </div>

        {/* Middle Panel - Chat Window */}
        <div className="flex-1 flex flex-col min-w-0">
          {selectedConversation ? (
            <div className="flex-1 overflow-hidden">
              <ChatWindow conversationId={selectedConversation} />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-muted/30">
              <ChatEmptyState type="no-selection" />
            </div>
          )}
        </div>

        {/* Right Panel - Seller Info (Desktop only, xl+) */}
        {selectedConversation && sellerId && isBuyer && (
          <div className="hidden xl:flex w-[280px] border-l border-border flex-shrink-0 bg-background">
            <ChatSellerPanel 
              sellerId={sellerId}
              currentProduct={currentConversationData?.product}
              chatType={currentConversationData?.chat_type}
              conversationCreatedAt={currentConversationData?.created_at}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
