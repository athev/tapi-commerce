import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Mail, MessageCircle } from "lucide-react";
import OrderDetailsModal from "@/components/orders/OrderDetailsModal";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatPrice, formatDate, getProductTypeLabel } from "@/utils/orderUtils";
import { getDeliveryStatusBadge, getOrderStatusBadge } from "./OrderStatusBadges";

interface Order {
  id: string;
  status: string;
  created_at: string;
  buyer_email: string | null;
  delivery_status: string | null;
  discount_amount?: number;
  bank_amount?: number;
  payment_verified_at?: string | null;
  products: {
    id: string;
    title: string;
    price: number;
    product_type: string;
  } | null;
}

interface OrdersTableProps {
  orders: Order[];
}

const OrdersTable = ({ orders }: OrdersTableProps) => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  return (
    <div className="bg-white rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Đơn hàng</TableHead>
            <TableHead>Sản phẩm</TableHead>
            <TableHead>Khách hàng</TableHead>
            <TableHead>Giá trị</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Thời gian</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>
                <div className="space-y-1">
                  <div className="font-mono text-sm">#{order.id.slice(0, 8)}</div>
                  {order.products?.product_type && (
                    <Badge variant="outline" className="text-xs">
                      {getProductTypeLabel(order.products.product_type)}
                    </Badge>
                  )}
                </div>
              </TableCell>
              
              <TableCell>
                <div className="max-w-xs">
                  <div className="font-medium truncate">{order.products?.title}</div>
                  <div className="text-sm text-gray-500">ID: {order.products?.id?.slice(0, 8)}</div>
                </div>
              </TableCell>
              
              <TableCell>
                <div className="text-sm">{order.buyer_email || 'Chưa có email'}</div>
              </TableCell>
              
              <TableCell>
                <div className="space-y-1">
                  {(() => {
                    const original = order.products?.price || 0;
                    const discount = order.discount_amount || 0;
                    const final = order.bank_amount || (original - discount);
                    
                    if (discount > 0) {
                      return (
                        <>
                          <div className="text-sm text-muted-foreground line-through">
                            {formatPrice(original)}
                          </div>
                          <div className="font-medium text-marketplace-primary">
                            {formatPrice(final)}
                          </div>
                          <div className="text-xs text-green-600">
                            Giảm {formatPrice(discount)}
                          </div>
                        </>
                      );
                    }
                    
                    return (
                      <div className="font-medium text-marketplace-primary">
                        {formatPrice(final)}
                      </div>
                    );
                  })()}
                </div>
              </TableCell>
              
              <TableCell>
                <div className="space-y-1">
                  {getOrderStatusBadge(order.status)}
                  {getDeliveryStatusBadge(order.delivery_status || 'pending')}
                </div>
              </TableCell>
              
              <TableCell>
                <div className="text-sm">{formatDate(order.created_at)}</div>
              </TableCell>
              
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Chi tiết
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedOrder && (
        <OrderDetailsModal
          open={!!selectedOrder}
          onOpenChange={(open) => !open && setSelectedOrder(null)}
          order={selectedOrder}
        />
      )}
    </div>
  );
};

export default OrdersTable;
