import { Bell, CheckCircle, AlertCircle, DollarSign, Package, MessageCircle, Star, CreditCard, AlertTriangle } from "lucide-react";
import { Notification } from "@/hooks/useRealtimeNotifications";
import { formatDate } from "@/utils/orderUtils";
import { cn } from "@/lib/utils";

interface NotificationItemProps {
  notification: Notification;
  onClick?: () => void;
  className?: string;
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'manual_payment_request':
    case 'payment_confirmed':
      return <DollarSign className="h-5 w-5 text-orange-600" />;
    case 'new_paid_order':
    case 'new_order':
      return <Package className="h-5 w-5 text-green-600" />;
    case 'order_confirmed':
    case 'buyer_confirmed_delivery':
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    case 'delivery_status_updated':
      return <Package className="h-5 w-5 text-blue-600" />;
    case 'dispute_created':
    case 'dispute_from_buyer':
      return <AlertTriangle className="h-5 w-5 text-red-600" />;
    case 'new_message':
      return <MessageCircle className="h-5 w-5 text-blue-600" />;
    case 'new_review':
      return <Star className="h-5 w-5 text-yellow-600" />;
    case 'withdrawal_approved':
    case 'withdrawal_rejected':
      return <CreditCard className="h-5 w-5 text-purple-600" />;
    default:
      return <Bell className="h-5 w-5 text-blue-600" />;
  }
};

const getNotificationColor = (type: string, isRead: boolean) => {
  if (isRead) return 'bg-gray-50 opacity-75';
  
  switch (type) {
    case 'manual_payment_request':
      return 'border-l-4 border-orange-500 bg-orange-50';
    case 'new_paid_order':
    case 'new_order':
      return 'border-l-4 border-green-500 bg-green-50';
    case 'payment_confirmed':
    case 'order_confirmed':
      return 'border-l-4 border-green-500 bg-green-50';
    case 'dispute_created':
    case 'dispute_from_buyer':
      return 'border-l-4 border-red-500 bg-red-50';
    default:
      return 'border-l-4 border-blue-500 bg-blue-50';
  }
};

export const NotificationItem = ({ notification, onClick, className }: NotificationItemProps) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-start gap-3 p-4 rounded-lg cursor-pointer transition-colors hover:bg-gray-100",
        getNotificationColor(notification.type, notification.is_read),
        className
      )}
    >
      <div className="flex-shrink-0 mt-1">
        {getNotificationIcon(notification.type)}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className={cn(
          "font-medium text-sm",
          notification.is_read ? "text-gray-700" : "text-gray-900"
        )}>
          {notification.title}
        </h4>
        <p className={cn(
          "text-sm mt-1",
          notification.is_read ? "text-gray-500" : "text-gray-600"
        )}>
          {notification.message}
        </p>
        <p className="text-xs text-gray-500 mt-2">{formatDate(notification.created_at)}</p>
      </div>
      {!notification.is_read && (
        <div className="flex-shrink-0">
          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
        </div>
      )}
    </div>
  );
};
