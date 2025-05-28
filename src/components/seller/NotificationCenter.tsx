
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCircle, AlertCircle, DollarSign, Package } from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/utils/orderUtils";

const NotificationCenter = () => {
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const { data: notifications, isLoading, refetch } = useQuery({
    queryKey: ['seller-notifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) {
        console.error('Error fetching notifications:', error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!user?.id
  });

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
      
      if (error) throw error;
      
      refetch();
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Có lỗi xảy ra khi đánh dấu đã đọc');
    }
  };

  const handleConfirmManualPayment = async (notificationId: string, orderId: string) => {
    setIsProcessing(notificationId);
    console.log('Starting manual payment confirmation from notification:', { notificationId, orderId });
    
    try {
      // Cập nhật đơn hàng
      const { data: updateData, error: orderError } = await supabase
        .from('orders')
        .update({ 
          status: 'paid',
          delivery_status: 'pending',
          payment_verified_at: new Date().toISOString(),
          manual_payment_requested: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select();
      
      if (orderError) {
        console.error('Error updating order:', orderError);
        throw orderError;
      }

      console.log('Order updated from notification:', updateData);

      // Đánh dấu thông báo đã đọc
      await handleMarkAsRead(notificationId);
      
      toast.success('Đã xác nhận thanh toán thành công');
      
      // Force refetch to update notifications
      await refetch();
      
    } catch (error) {
      console.error('Error confirming manual payment:', error);
      toast.error('Có lỗi xảy ra khi xác nhận thanh toán');
    } finally {
      setIsProcessing(null);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'manual_payment_request':
        return <DollarSign className="h-5 w-5 text-orange-600" />;
      case 'new_paid_order':
        return <Package className="h-5 w-5 text-green-600" />;
      case 'payment_confirmed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      default:
        return <Bell className="h-5 w-5 text-blue-600" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'manual_payment_request':
        return 'border-orange-200 bg-orange-50';
      case 'new_paid_order':
        return 'border-green-200 bg-green-50';
      case 'payment_confirmed':
        return 'border-green-200 bg-green-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-marketplace-primary"></div>
      </div>
    );
  }

  const unreadNotifications = notifications?.filter(n => !n.is_read) || [];
  const readNotifications = notifications?.filter(n => n.is_read) || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Thông báo</h2>
        <Badge variant="outline">
          {unreadNotifications.length} chưa đọc
        </Badge>
      </div>

      {/* Unread Notifications */}
      {unreadNotifications.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Thông báo mới</h3>
          {unreadNotifications.map((notification) => (
            <Card key={notification.id} className={`${getNotificationColor(notification.type)} border-l-4`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {getNotificationIcon(notification.type)}
                  <div className="flex-1">
                    <h4 className="font-medium">{notification.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-2">{formatDate(notification.created_at)}</p>
                  </div>
                  <div className="flex gap-2">
                    {notification.type === 'manual_payment_request' && notification.related_order_id && (
                      <Button
                        size="sm"
                        onClick={() => handleConfirmManualPayment(notification.id, notification.related_order_id)}
                        disabled={isProcessing === notification.id}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {isProcessing === notification.id ? 'Đang xử lý...' : 'Xác nhận'}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMarkAsRead(notification.id)}
                    >
                      Đánh dấu đã đọc
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Read Notifications */}
      {readNotifications.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-600">Đã đọc</h3>
          {readNotifications.map((notification) => (
            <Card key={notification.id} className="bg-gray-50 opacity-75">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {getNotificationIcon(notification.type)}
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-700">{notification.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-2">{formatDate(notification.created_at)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {(!notifications || notifications.length === 0) && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Chưa có thông báo</h3>
          <p className="text-gray-500">Các thông báo mới sẽ xuất hiện ở đây</p>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
