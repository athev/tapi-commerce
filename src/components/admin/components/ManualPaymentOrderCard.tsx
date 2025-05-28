
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice, formatDate } from "@/utils/orderUtils";

interface Order {
  id: string;
  created_at: string;
  buyer_email: string;
  products: {
    title: string;
    price: number;
    image?: string;
  };
}

interface ManualPaymentOrderCardProps {
  order: Order;
  isProcessing: boolean;
  onConfirm: (orderId: string) => void;
  onReject: (orderId: string) => void;
}

const ManualPaymentOrderCard = ({ 
  order, 
  isProcessing, 
  onConfirm, 
  onReject 
}: ManualPaymentOrderCardProps) => {
  return (
    <Card className="border-orange-200">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="h-16 w-16 bg-gray-100 rounded overflow-hidden shrink-0">
            <img 
              src={order.products?.image || '/placeholder.svg'} 
              alt={order.products?.title}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="flex-1">
            <div className="font-medium">{order.products?.title}</div>
            <div className="text-sm text-gray-500">
              Mã đơn hàng: {order.id.substring(0, 8).toUpperCase()} | 
              Ngày đặt: {formatDate(order.created_at)}
            </div>
            <div className="text-sm text-gray-500">
              Email: {order.buyer_email}
            </div>
            <Badge variant="outline" className="text-orange-600 border-orange-600 mt-1">
              Yêu cầu xác nhận thủ công
            </Badge>
          </div>
          
          <div className="text-right">
            <div className="font-medium text-marketplace-primary mb-2">
              {formatPrice(order.products?.price || 0)}
            </div>
            
            <div className="flex space-x-2 justify-end">
              <Button
                onClick={() => onConfirm(order.id)}
                disabled={isProcessing}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 text-sm"
              >
                {isProcessing ? 'Đang xử lý...' : 'Xác nhận'}
              </Button>
              <Button
                onClick={() => onReject(order.id)}
                disabled={isProcessing}
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50 px-3 py-1 text-sm"
              >
                Từ chối
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ManualPaymentOrderCard;
