
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Download, Mail, MessageCircle } from "lucide-react";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', { 
    style: 'currency', 
    currency: 'VND',
    maximumFractionDigits: 0 
  }).format(price);
};

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

const getDeliveryStatusBadge = (status: string) => {
  switch (status) {
    case 'delivered':
      return <Badge className="bg-green-500">Đã giao</Badge>;
    case 'failed':
      return <Badge className="bg-red-500">Thất bại</Badge>;
    default:
      return <Badge className="bg-yellow-500">Chờ xử lý</Badge>;
  }
};

const getOrderStatusBadge = (status: string) => {
  switch (status) {
    case 'paid':
      return <Badge className="bg-green-500">Đã thanh toán</Badge>;
    case 'pending':
      return <Badge className="bg-yellow-500">Chờ thanh toán</Badge>;
    case 'cancelled':
      return <Badge className="bg-red-500">Đã hủy</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const getProductTypeLabel = (type: string) => {
  const types = {
    file_download: 'Tải xuống file',
    license_key_delivery: 'Gửi License Key',
    shared_account: 'Tài khoản dùng chung',
    upgrade_account_no_pass: 'Nâng cấp tài khoản',
    upgrade_account_with_pass: 'Nâng cấp tài khoản (có pass)'
  };
  return types[type as keyof typeof types] || type;
};

const SellerOrders = () => {
  const { user } = useAuth();

  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['seller-orders', user?.id],
    queryFn: async () => {
      try {
        if (!user) {
          console.log('No user found for seller orders');
          return [];
        }
        
        console.log('Fetching seller orders for user:', user.id);
        
        // Direct query to get orders for products sold by this seller
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select(`
            *,
            product:products!inner(
              id,
              title,
              price,
              product_type,
              seller_id,
              seller_name
            )
          `)
          .eq('product.seller_id', user.id)
          .order('created_at', { ascending: false });
        
        if (ordersError) {
          console.error('Error fetching seller orders:', ordersError);
          throw ordersError;
        }

        console.log('Seller orders fetched successfully:', ordersData?.length || 0, 'orders');
        console.log('Sample order data:', ordersData?.[0]);
        
        return ordersData || [];
      } catch (error) {
        console.error('Error in seller orders query:', error);
        throw error;
      }
    },
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-marketplace-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 bg-red-50 rounded-lg">
        <h3 className="text-lg font-medium mb-2 text-red-800">Có lỗi xảy ra</h3>
        <p className="text-red-600">Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Đơn hàng</h2>
        <div className="text-sm text-gray-600">
          Tổng: {orders?.length || 0} đơn hàng
        </div>
      </div>
      
      {orders && orders.length > 0 ? (
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
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium mb-2">Chưa có đơn hàng nào</h3>
          <p className="text-gray-500">Đơn hàng của khách hàng sẽ xuất hiện ở đây khi có người mua sản phẩm của bạn.</p>
        </div>
      )}
    </div>
  );
};

export default SellerOrders;
