import { Card } from "@/components/ui/card";
import { FileText, Package, Truck, Star, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusCount {
  pending: number;
  processing: number;
  delivered: number;
  needReview: number;
}

interface OrderStatusQuickAccessProps {
  counts: StatusCount;
  onViewAll: () => void;
  onStatusClick: (status: string) => void;
}

const OrderStatusQuickAccess = ({ counts, onViewAll, onStatusClick }: OrderStatusQuickAccessProps) => {
  const statuses = [
    { 
      key: 'pending', 
      icon: FileText, 
      label: 'Chờ thanh toán', 
      count: counts.pending,
      color: 'text-orange-500'
    },
    { 
      key: 'processing', 
      icon: Package, 
      label: 'Đang xử lý', 
      count: counts.processing,
      color: 'text-blue-500'
    },
    { 
      key: 'delivered', 
      icon: Truck, 
      label: 'Đã giao', 
      count: counts.delivered,
      color: 'text-green-500'
    },
    { 
      key: 'review', 
      icon: Star, 
      label: 'Đánh giá', 
      count: counts.needReview,
      color: 'text-yellow-500'
    },
  ];

  return (
    <Card className="mx-4 -mt-4 relative z-10 rounded-xl shadow-md">
      {/* Header */}
      <div 
        className="flex justify-between items-center p-4 border-b cursor-pointer hover:bg-accent/50 transition-colors"
        onClick={onViewAll}
      >
        <span className="font-semibold">Đơn mua</span>
        <div className="flex items-center gap-1 text-sm text-primary">
          <span>Xem lịch sử mua hàng</span>
          <ChevronRight className="h-4 w-4" />
        </div>
      </div>

      {/* Status Icons */}
      <div className="grid grid-cols-4 p-4 gap-2">
        {statuses.map(({ key, icon: Icon, label, count, color }) => (
          <button
            key={key}
            className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-accent/50 transition-colors"
            onClick={() => onStatusClick(key)}
          >
            <div className="relative">
              <Icon className={cn("h-6 w-6", color)} />
              {count > 0 && (
                <span className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {count > 99 ? '99+' : count}
                </span>
              )}
            </div>
            <span className="text-xs text-muted-foreground text-center leading-tight">{label}</span>
          </button>
        ))}
      </div>
    </Card>
  );
};

export default OrderStatusQuickAccess;
