import { ArrowLeft, MoreVertical, Phone } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface MobileChatHeaderProps {
  sellerName: string;
  shopName?: string;
  sellerAvatar?: string;
  isOnline?: boolean;
  onBack: () => void;
}

const MobileChatHeader = ({
  sellerName,
  shopName,
  sellerAvatar,
  isOnline,
  onBack,
}: MobileChatHeaderProps) => {
  return (
    <div className="flex items-center gap-3 p-3 border-b bg-background sticky top-0 z-10">
      <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
        <ArrowLeft className="h-5 w-5" />
      </Button>
      
      <div className="relative">
        <Avatar className="h-10 w-10">
          <AvatarImage src={sellerAvatar} alt={sellerName} />
          <AvatarFallback className="bg-primary/10 text-primary">
            {sellerName?.charAt(0)?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        {isOnline && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <span className="font-semibold text-foreground truncate">{sellerName}</span>
          {shopName && (
            <>
              <span className="text-muted-foreground">~</span>
              <span className="text-muted-foreground truncate text-sm">{shopName}</span>
            </>
          )}
        </div>
        {isOnline && (
          <span className="text-xs text-green-600">Đang hoạt động</span>
        )}
      </div>
      
      <Button variant="ghost" size="icon" className="shrink-0">
        <Phone className="h-5 w-5" />
      </Button>
      <Button variant="ghost" size="icon" className="shrink-0">
        <MoreVertical className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default MobileChatHeader;
