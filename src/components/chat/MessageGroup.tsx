import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { Message } from "@/hooks/useChat";

interface MessageGroupProps {
  messages: Message[];
  isOwn: boolean;
  senderName: string;
}

const MessageGroup = ({ messages, isOwn, senderName }: MessageGroupProps) => {
  if (messages.length === 0) return null;

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} gap-2 mb-4`}>
      {!isOwn && (
        <Avatar className="h-8 w-8 mt-1 flex-shrink-0">
          <AvatarFallback className="text-xs">
            {senderName?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={`flex flex-col gap-1 max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
        {!isOwn && (
          <span className="text-xs text-gray-500 px-2">{senderName}</span>
        )}
        
        {messages.map((message, index) => (
          <div key={message.id}>
            {message.message_type === 'image' && message.image_url ? (
              <div className={`rounded-lg overflow-hidden ${isOwn ? 'bg-primary' : 'bg-gray-100'}`}>
                <img
                  src={message.image_url}
                  alt="Sent image"
                  className="max-w-full h-auto max-h-64 object-contain"
                />
              </div>
            ) : (
              <div
                className={`rounded-lg px-4 py-2 ${
                  isOwn
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap break-words">
                  {message.content}
                </p>
              </div>
            )}
            
            {index === messages.length - 1 && (
              <span className="text-xs text-gray-400 px-2 mt-1">
                {formatDistanceToNow(new Date(message.created_at), {
                  addSuffix: true,
                  locale: vi
                })}
              </span>
            )}
          </div>
        ))}
      </div>
      
      {isOwn && (
        <Avatar className="h-8 w-8 mt-1 flex-shrink-0">
          <AvatarFallback className="text-xs bg-primary text-primary-foreground">
            {senderName?.charAt(0) || 'B'}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

export default MessageGroup;
