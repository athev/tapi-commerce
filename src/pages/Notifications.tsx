import { useState } from "react";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import { NotificationItem } from "@/components/notifications/NotificationItem";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Bell, Volume2, VolumeX } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNotificationSound } from "@/hooks/useNotificationSound";
import { Card } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";

const Notifications = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, isLoading } = useRealtimeNotifications();
  const { isSoundEnabled, toggleSound } = useNotificationSound();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const isMobile = useIsMobile();

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.is_read)
    : notifications;

  const handleNotificationClick = async (notification: any) => {
    await markAsRead(notification.id);
    
    if (notification.action_url) {
      navigate(notification.action_url);
    }
  };

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto py-8">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="min-h-screen bg-background">
        {/* Sticky Mobile Header */}
        <div className="sticky top-0 bg-background z-10 border-b">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-lg font-bold">Thông báo</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={toggleSound}>
                {isSoundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>
              {unreadCount > 0 && (
                <Button size="sm" variant="outline" onClick={() => markAllAsRead()}>
                  Đọc tất cả
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="px-4 py-3 border-b">
          <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="all">
                Tất cả ({notifications.length})
              </TabsTrigger>
              <TabsTrigger value="unread">
                Chưa đọc ({unreadCount})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Notification List */}
        <div className="pb-20">
          {filteredNotifications.length > 0 ? (
            <div className="divide-y">
              {filteredNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onClick={() => handleNotificationClick(notification)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 px-4">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {filter === 'unread' ? 'Không có thông báo chưa đọc' : 'Chưa có thông báo'}
              </h3>
              <p className="text-muted-foreground text-sm">
                {filter === 'unread' 
                  ? 'Tất cả thông báo đã được đọc' 
                  : 'Các thông báo mới sẽ xuất hiện ở đây'}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Thông báo</h1>
            <p className="text-muted-foreground mt-1">
              Quản lý tất cả thông báo của bạn
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleSound}
            title={isSoundEnabled ? "Tắt âm thanh" : "Bật âm thanh"}
          >
            {isSoundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>
          
          {unreadCount > 0 && (
            <Button onClick={() => markAllAsRead()}>
              Đánh dấu tất cả đã đọc
            </Button>
          )}
        </div>
      </div>

      <Card className="p-4 mb-6">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="all">
              Tất cả ({notifications.length})
            </TabsTrigger>
            <TabsTrigger value="unread">
              Chưa đọc ({unreadCount})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </Card>

      {filteredNotifications.length > 0 ? (
        <div className="space-y-2">
          {filteredNotifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onClick={() => handleNotificationClick(notification)}
              className="bg-card border"
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-card rounded-lg border">
          <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">
            {filter === 'unread' ? 'Không có thông báo chưa đọc' : 'Chưa có thông báo'}
          </h3>
          <p className="text-muted-foreground">
            {filter === 'unread' 
              ? 'Tất cả thông báo đã được đọc' 
              : 'Các thông báo mới sẽ xuất hiện ở đây'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Notifications;
