import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { ArrowLeft, Search, MessageCircle, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import MobileOrderCard from "./MobileOrderCard";

interface MobileOrderListProps {
  orders: any[];
  reviewedOrders: string[];
  initialFilter?: string;
  onBack: () => void;
  onViewDetails: (order: any) => void;
  onReview: (order: any) => void;
}

const MobileOrderList = ({
  orders,
  reviewedOrders,
  initialFilter = 'all',
  onBack,
  onViewDetails,
  onReview,
}: MobileOrderListProps) => {
  const [activeTab, setActiveTab] = useState(initialFilter);

  const tabs = [
    { value: 'all', label: 'Tất cả' },
    { value: 'pending', label: 'Chờ thanh toán' },
    { value: 'processing', label: 'Đang xử lý' },
    { value: 'delivered', label: 'Đã giao' },
    { value: 'completed', label: 'Hoàn thành' },
    { value: 'cancelled', label: 'Đã hủy' },
  ];

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return order.status === 'pending';
    if (activeTab === 'processing') return order.status === 'paid' && order.delivery_status === 'processing';
    if (activeTab === 'delivered') return order.status === 'paid' && order.delivery_status === 'delivered';
    if (activeTab === 'completed') return order.status === 'paid' && order.delivery_status === 'completed';
    if (activeTab === 'cancelled') return order.status === 'cancelled';
    return true;
  });

  const handleBuyAgain = (order: any) => {
    window.location.href = `/product/${order.product?.slug || order.product_id}`;
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-background z-20 border-b">
        <div className="flex items-center gap-3 p-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <span className="font-semibold flex-1">Đơn đã mua</span>
          <Button variant="ghost" size="icon">
            <Search className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <MessageCircle className="h-5 w-5" />
          </Button>
        </div>

        {/* Horizontal Tabs */}
        <ScrollArea className="w-full">
          <div className="flex px-4 gap-6">
            {tabs.map(tab => (
              <button
                key={tab.value}
                className={cn(
                  "py-3 text-sm whitespace-nowrap border-b-2 transition-colors",
                  activeTab === tab.value
                    ? "border-primary text-primary font-medium"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setActiveTab(tab.value)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Order List */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {filteredOrders.length > 0 ? (
            filteredOrders.map(order => (
              <MobileOrderCard
                key={order.id}
                order={order}
                hasReview={reviewedOrders.includes(order.id)}
                onViewDetails={() => onViewDetails(order)}
                onReview={() => onReview(order)}
                onBuyAgain={() => handleBuyAgain(order)}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Package className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="font-medium text-muted-foreground mb-2">Chưa có đơn hàng nào</h3>
              <p className="text-sm text-muted-foreground">
                {activeTab === 'all' 
                  ? 'Bạn chưa có đơn hàng nào. Hãy mua sắm ngay!'
                  : 'Không có đơn hàng nào trong mục này'}
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default MobileOrderList;
