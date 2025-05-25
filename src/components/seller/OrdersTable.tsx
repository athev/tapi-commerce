
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Mail, MessageCircle } from "lucide-react";
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
  buyer_data: any;
  delivery_status: string | null;
  product: {
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
                  {order.product?.product_type && (
                    <Badge variant="outline" className="text-xs">
                      {getProductTypeLabel(order.product.product_type)}
                    </Badge>
                  )}
                </div>
              </TableCell>
              
              <TableCell>
                <div className="max-w-xs">
                  <div className="font-medium truncate">{order.product?.title}</div>
                  <div className="text-sm text-gray-500">ID: {order.product?.id?.slice(0, 8)}</div>
                </div>
              </TableCell>
              
              <TableCell>
                <div className="space-y-1">
                  <div className="text-sm">{order.buyer_email || 'Chưa có email'}</div>
                  {order.buyer_data && Object.keys(order.buyer_data).length > 0 && (
                    <div className="text-xs text-gray-500">
                      Có thông tin bổ sung
                    </div>
                  )}
                </div>
              </TableCell>
              
              <TableCell>
                <div className="font-medium text-marketplace-primary">
                  {formatPrice(order.product?.price || 0)}
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
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    Chi tiết
                  </Button>
                  
                  {order.product?.product_type === 'shared_account' && (
                    <Button variant="outline" size="sm">
                      <MessageCircle className="h-4 w-4 mr-1" />
                      CSKH
                    </Button>
                  )}
                  
                  {(order.product?.product_type === 'upgrade_account_no_pass' || 
                    order.product?.product_type === 'upgrade_account_with_pass') && (
                    <Button variant="outline" size="sm">
                      <Mail className="h-4 w-4 mr-1" />
                      Gửi
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default OrdersTable;
