import { Check, Clock, Package, CreditCard, AlertCircle } from "lucide-react";
import { formatDate } from "@/utils/orderUtils";

interface OrderTimelineProps {
  order: any;
}

interface TimelineEvent {
  icon: any;
  label: string;
  time: string | null;
  status: string;
  notes?: string;
}

const OrderTimeline = ({ order }: OrderTimelineProps) => {
  const events: TimelineEvent[] = [];

  // Order created
  events.push({
    icon: Clock,
    label: "Đơn hàng được tạo",
    time: order.created_at,
    status: "completed"
  });

  // Payment verified
  if (order.payment_verified_at) {
    events.push({
      icon: CreditCard,
      label: "Thanh toán được xác nhận",
      time: order.payment_verified_at,
      status: "completed"
    });
  } else if (order.status === 'pending') {
    events.push({
      icon: Clock,
      label: "Chờ thanh toán",
      time: null,
      status: "pending"
    });
  }

  // Delivery status
  if (order.delivery_status === 'processing') {
    events.push({
      icon: Package,
      label: "Đang xử lý giao hàng",
      time: order.updated_at,
      status: "active",
      notes: order.delivery_notes
    });
  } else if (order.delivery_status === 'delivered') {
    events.push({
      icon: Check,
      label: "Đã giao hàng",
      time: order.updated_at,
      status: "completed",
      notes: order.delivery_notes
    });
  } else if (order.delivery_status === 'failed') {
    events.push({
      icon: AlertCircle,
      label: "Giao hàng thất bại",
      time: order.updated_at,
      status: "failed",
      notes: order.delivery_notes
    });
  }

  return (
    <div className="space-y-4">
      {events.map((event, index) => {
        const Icon = event.icon;
        const isLast = index === events.length - 1;
        
        return (
          <div key={index} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className={`
                rounded-full p-2 
                ${event.status === 'completed' ? 'bg-green-500/20 text-green-600' : ''}
                ${event.status === 'active' ? 'bg-blue-500/20 text-blue-600' : ''}
                ${event.status === 'pending' ? 'bg-gray-300/20 text-gray-400' : ''}
                ${event.status === 'failed' ? 'bg-red-500/20 text-red-600' : ''}
              `}>
                <Icon className="h-4 w-4" />
              </div>
              {!isLast && (
                <div className={`
                  w-0.5 h-8 
                  ${event.status === 'completed' ? 'bg-green-500/30' : 'bg-gray-300'}
                `} />
              )}
            </div>
            
            <div className="flex-1 pb-4">
              <p className={`
                font-medium text-sm
                ${event.status === 'pending' ? 'text-muted-foreground' : ''}
              `}>
                {event.label}
              </p>
              {event.time && (
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDate(event.time)}
                </p>
              )}
              {event.notes && (
                <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
                  <p className="font-medium mb-1">Ghi chú từ người bán:</p>
                  <p className="whitespace-pre-wrap">{event.notes}</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default OrderTimeline;
