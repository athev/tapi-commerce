
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ConversationList from "@/components/chat/ConversationList";
import ChatWindow from "@/components/chat/ChatWindow";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle } from "lucide-react";

const Chat = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<string | undefined>(conversationId);

  const handleConversationSelect = (id: string) => {
    setSelectedConversation(id);
    navigate(`/chat/${id}`);
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageCircle className="h-16 w-16 text-gray-400 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Cần đăng nhập để chat
            </h2>
            <p className="text-gray-600 text-center">
              Vui lòng đăng nhập để sử dụng tính năng chat với người bán
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-160px)]">
        {/* Conversation List - Hidden on mobile when a conversation is selected */}
        <div className={`lg:col-span-1 ${selectedConversation ? 'hidden lg:block' : 'block'}`}>
          <ConversationList
            onConversationSelect={handleConversationSelect}
            selectedConversationId={selectedConversation}
          />
        </div>

        {/* Chat Window */}
        <div className={`lg:col-span-2 ${!selectedConversation ? 'hidden lg:block' : 'block'}`}>
          {selectedConversation ? (
            <ChatWindow conversationId={selectedConversation} />
          ) : (
            <Card className="h-full">
              <CardContent className="flex flex-col items-center justify-center h-full">
                <MessageCircle className="h-16 w-16 text-gray-400 mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Chọn cuộc trò chuyện
                </h2>
                <p className="text-gray-600 text-center">
                  Chọn một cuộc trò chuyện để bắt đầu nhắn tin
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
