
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ConversationList from "@/components/chat/ConversationList";
import ChatWindow from "@/components/chat/ChatWindow";
import ChatSellerPanel from "@/components/chat/ChatSellerPanel";
import { useAuth } from "@/context/AuthContext";
import { useChat } from "@/hooks/useChat";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, ArrowLeft } from "lucide-react";
import EnhancedNavbar from "@/components/layout/EnhancedNavbar";
import ChatEmptyState from "@/components/chat/ChatEmptyState";

const Chat = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { conversations } = useChat();
  const [selectedConversation, setSelectedConversation] = useState<string | undefined>(conversationId);

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

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Navbar - Only show on desktop or when no conversation selected on mobile */}
      <div className="hidden lg:block">
        <EnhancedNavbar />
      </div>
      
      {/* Main Chat Container - Facebook Messenger style */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Conversation List */}
        <div className={`
          w-full lg:w-[320px] xl:w-[360px] 
          border-r border-border 
          flex-shrink-0 
          bg-background
          ${selectedConversation ? 'hidden lg:flex' : 'flex'}
          flex-col
        `}>
          {/* Mobile Header for Conversation List */}
          <div className="lg:hidden border-b p-3 flex items-center gap-2">
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
        <div className={`
          flex-1 
          flex flex-col
          min-w-0
          ${!selectedConversation ? 'hidden lg:flex' : 'flex'}
        `}>
          {/* Mobile Header with Back Button */}
          {selectedConversation && (
            <div className="lg:hidden border-b p-2 flex items-center gap-2 bg-background">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToList}
                className="gap-1"
              >
                <ArrowLeft className="h-4 w-4" />
                Quay lại
              </Button>
            </div>
          )}
          
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

        {/* Right Panel - Seller Info (Desktop only) */}
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
