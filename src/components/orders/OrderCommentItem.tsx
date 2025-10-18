import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/utils/orderUtils";

interface Comment {
  id: string;
  content: string;
  sender_id: string;
  sender_name?: string;
  sender_role?: string;
  created_at: string;
}

interface OrderCommentItemProps {
  comment: Comment;
  currentUserId?: string;
}

const OrderCommentItem = ({ comment, currentUserId }: OrderCommentItemProps) => {
  const isCurrentUser = comment.sender_id === currentUserId;
  const isSeller = comment.sender_role === 'seller';
  
  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className={`flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarFallback className={isSeller ? 'bg-primary/10 text-primary' : 'bg-muted'}>
          {getInitials(comment.sender_name)}
        </AvatarFallback>
      </Avatar>
      
      <div className={`flex-1 space-y-1 ${isCurrentUser ? 'items-end' : 'items-start'}`}>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {comment.sender_name || 'Người dùng'}
          </span>
          {isSeller && (
            <Badge variant="secondary" className="text-xs">Người bán</Badge>
          )}
        </div>
        
        <div className={`
          rounded-lg p-3 text-sm
          ${isCurrentUser 
            ? 'bg-primary text-primary-foreground ml-auto' 
            : 'bg-muted'
          }
          max-w-[80%]
        `}>
          <p className="whitespace-pre-wrap break-words">{comment.content}</p>
        </div>
        
        <p className="text-xs text-muted-foreground">
          {formatDate(comment.created_at)}
        </p>
      </div>
    </div>
  );
};

export default OrderCommentItem;
