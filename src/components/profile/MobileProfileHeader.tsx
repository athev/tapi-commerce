import { useAuth } from "@/context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Settings, Bell, MessageCircle, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface MobileProfileHeaderProps {
  orderCount?: number;
  piBalance?: number;
}

const MobileProfileHeader = ({ orderCount = 0, piBalance = 0 }: MobileProfileHeaderProps) => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const getRoleLabel = () => {
    if (profile?.role === 'admin') return 'Quản trị viên';
    if (profile?.role === 'seller') return 'Người bán';
    return 'Khách hàng';
  };

  const displayName = profile?.full_name || user?.user_metadata?.full_name || 'Người dùng';
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-4 pb-8">
      {/* Top Actions */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium opacity-90">Hồ sơ</span>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-primary-foreground hover:bg-white/20"
            onClick={() => navigate('/notifications')}
          >
            <Bell className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-primary-foreground hover:bg-white/20"
            onClick={() => navigate('/chat')}
          >
            <MessageCircle className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-primary-foreground hover:bg-white/20"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* User Info */}
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16 border-2 border-white/50">
          <AvatarImage src={(profile as any)?.avatar} alt={displayName} />
          <AvatarFallback className="bg-white/20 text-primary-foreground text-lg font-semibold">
            {initials || <User className="h-8 w-8" />}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h2 className="font-bold text-lg">{displayName}</h2>
          <p className="text-sm opacity-80">{getRoleLabel()}</p>
          <div className="flex items-center gap-4 mt-1 text-sm opacity-90">
            <span>{orderCount} đơn hàng</span>
            <span>•</span>
            <span>{piBalance} PI</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileProfileHeader;
