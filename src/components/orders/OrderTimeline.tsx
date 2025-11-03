import { Check, Clock, Package, Truck } from "lucide-react";

interface OrderTimelineProps {
  status: string;
  deliveryStatus?: string;
  createdAt: string;
  paidAt?: string | null;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const OrderTimeline = ({ 
  status, 
  deliveryStatus, 
  createdAt, 
  paidAt 
}: OrderTimelineProps) => {
  const steps = [
    { 
      icon: Clock, 
      label: "Đặt hàng", 
      time: createdAt,
      completed: true 
    },
    { 
      icon: Check, 
      label: "Thanh toán", 
      time: paidAt,
      completed: status === 'paid' 
    },
    { 
      icon: Package, 
      label: "Đang xử lý", 
      completed: deliveryStatus === 'processing' || deliveryStatus === 'delivered' || deliveryStatus === 'completed'
    },
    { 
      icon: Truck, 
      label: "Đã giao", 
      completed: deliveryStatus === 'delivered' || deliveryStatus === 'completed'
    }
  ];

  return (
    <div className="flex items-center gap-2">
      {steps.map((step, index) => {
        const Icon = step.icon;
        return (
          <div key={index} className="flex items-center gap-2 flex-1">
            <div className="flex items-center gap-2 flex-1">
              <div className={`
                h-8 w-8 rounded-full flex items-center justify-center shrink-0
                ${step.completed 
                  ? 'bg-success text-white' 
                  : 'bg-muted text-muted-foreground'}
              `}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="hidden md:block">
                <div className={`text-xs font-medium ${step.completed ? 'text-success' : 'text-muted-foreground'}`}>
                  {step.label}
                </div>
                {step.time && (
                  <div className="text-[10px] text-muted-foreground">
                    {formatDate(step.time)}
                  </div>
                )}
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className={`h-0.5 w-full ${step.completed ? 'bg-success' : 'bg-muted'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default OrderTimeline;
