import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import { NotificationItem } from "@/components/notifications/NotificationItem";
import { useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";

export const NotificationDropdown = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useRealtimeNotifications();
  const navigate = useNavigate();
  
  const recentNotifications = notifications.slice(0, 10);

  const handleNotificationClick = async (notification: any) => {
    // Mark as read
    await markAsRead(notification.id);
    
    // Navigate if there's an action URL
    if (notification.action_url) {
      navigate(notification.action_url);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[380px] p-0">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Thông báo</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllAsRead()}
              className="h-auto p-1 text-xs"
            >
              Đánh dấu tất cả đã đọc
            </Button>
          )}
        </div>
        
        {recentNotifications.length > 0 ? (
          <>
            <ScrollArea className="h-[400px]">
              <div className="p-2 space-y-1">
                {recentNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onClick={() => handleNotificationClick(notification)}
                  />
                ))}
              </div>
            </ScrollArea>
            
            <Separator />
            
            <div className="p-2">
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => navigate('/notifications')}
              >
                Xem tất cả thông báo
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <Bell className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-sm text-gray-500 text-center">
              Chưa có thông báo mới
            </p>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
