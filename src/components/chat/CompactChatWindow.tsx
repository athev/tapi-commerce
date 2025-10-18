import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Image } from "lucide-react";
import { useChat, Message } from "@/hooks/useChat";
import { useAuth } from "@/context/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CompactChatWindowProps {
  conversationId: string;
}

const CompactChatWindow = ({ conversationId }: CompactChatWindowProps) => {
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { 
    messages, 
    conversations,
    sendMessage, 
    uploadImage,
    setCurrentConversation,
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

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Messages Area */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-center text-sm text-muted-foreground py-8">
                Chưa có tin nhắn. Hãy bắt đầu cuộc trò chuyện!
              </div>
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
                    <Avatar className="h-7 w-7 mt-1 flex-shrink-0">
                      <AvatarFallback className="text-xs">
                        {senderDisplayName?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div className={`max-w-[75%] ${isOwn ? 'order-2' : 'order-1'}`}>
                    <div
                      className={`rounded-2xl px-3 py-2 break-words ${
                        isOwn
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground'
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
                    <div className={`text-xs text-muted-foreground mt-1 px-2 ${isOwn ? 'text-right' : 'text-left'}`}>
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

      {/* Message Input */}
      <div className="flex-shrink-0 border-t p-3 bg-background">
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            title="Gửi hình ảnh"
            className="h-9 w-9 p-0 flex-shrink-0"
          >
            <Image className="h-4 w-4" />
          </Button>
          
          <Input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Nhập tin nhắn..."
            disabled={isUploading}
            className="flex-1 h-9 text-sm"
          />
          
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || isUploading}
            size="sm"
            className="h-9 px-3"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CompactChatWindow;
