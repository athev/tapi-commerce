
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Calendar, DollarSign } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

interface Order {
  id: string;
  status: string;
  created_at: string;
  delivery_status?: string;
  products?: {
    title: string;
    price: number;
  };
}

interface OrderInfoCardProps {
  order: Order;
}

const OrderInfoCard = ({ order }: OrderInfoCardProps) => {
  const getStatusBadge = (status: string) => {
    const statusMap = {
      'pending': { label: 'Chờ thanh toán', variant: 'secondary' as const },
      'paid': { label: 'Đã thanh toán', variant: 'default' as const },
      'cancelled': { label: 'Đã hủy', variant: 'destructive' as const },
    };
    return statusMap[status as keyof typeof statusMap] || { label: status, variant: 'secondary' as const };
  };

  const getDeliveryStatusBadge = (status: string) => {
    const statusMap = {
      'pending': { label: 'Chờ xử lý', variant: 'secondary' as const },
      'processing': { label: 'Đang xử lý', variant: 'default' as const },
      'delivered': { label: 'Đã giao', variant: 'default' as const },
      'failed': { label: 'Giao thất bại', variant: 'destructive' as const },
    };
    return statusMap[status as keyof typeof statusMap] || { label: status, variant: 'secondary' as const };
  };

  const statusBadge = getStatusBadge(order.status);
  const deliveryBadge = order.delivery_status ? getDeliveryStatusBadge(order.delivery_status) : null;

  return (
    <Card className="border-l-4 border-l-blue-500 mb-4">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-sm">
              Đơn hàng: #{order.id.slice(0, 8)}
            </span>
          </div>
          <div className="flex gap-2">
            <Badge variant={statusBadge.variant}>
              {statusBadge.label}
            </Badge>
            {deliveryBadge && (
              <Badge variant={deliveryBadge.variant}>
                {deliveryBadge.label}
              </Badge>
            )}
          </div>
        </div>

        {order.products && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Sản phẩm: {order.products.title}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="h-3 w-3 text-green-600" />
              <span className="font-medium text-green-600">
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND'
                }).format(order.products.price)}
              </span>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 text-xs text-gray-500 mt-3">
          <Calendar className="h-3 w-3" />
          <span>
            Đặt hàng {formatDistanceToNow(new Date(order.created_at), { 
              addSuffix: true, 
              locale: vi 
            })}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderInfoCard;
