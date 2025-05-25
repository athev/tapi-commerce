
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Download, Mail, MessageCircle } from "lucide-react";

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

  const { data: orders, isLoading } = useQuery({
    queryKey: ['seller-orders', user?.id],
    queryFn: async () => {
      try {
        if (!user) return [];
        
        console.log('Fetching seller orders for user:', user.id);
        
        const { data: sellerProducts, error: productsError } = await supabase
          .from('products')
          .select('id')
          .eq('seller_id', user.id);
        
        if (productsError) {
          console.error('Error fetching seller products:', productsError);
          return [];
        }

        if (!sellerProducts || sellerProducts.length === 0) {
          console.log('No products found for seller');
          return [];
        }

        const productIds = sellerProducts.map(p => p.id);
        
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select(`
            *,
            product:products(*)
          `)
          .in('product_id', productIds)
          .order('created_at', { ascending: false });
        
        if (ordersError) {
          console.error('Error fetching orders:', ordersError);
          return [];
        }

        console.log('Seller orders with products:', ordersData);
        return ordersData || [];
      } catch (error) {
        console.error('Error fetching seller orders:', error);
        return [];
      }
    },
    enabled: !!user,
  });

  if (isLoading) {
    return <div className="flex justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-marketplace-primary"></div>
    </div>;
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
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{order.product?.title}</CardTitle>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                      <span>#{order.id.slice(0, 8)}</span>
                      <span>{formatDate(order.created_at)}</span>
                      <Badge variant="outline">{getProductTypeLabel(order.product?.product_type || '')}</Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-marketplace-primary text-lg">
                      {formatPrice(order.product?.price || 0)}
                    </div>
                    <div className="space-y-1">
                      <Badge className={
                        order.status === 'paid' ? 'bg-green-500' : 
                        order.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                      }>
                        {order.status === 'paid' ? 'Đã thanh toán' : 
                         order.status === 'pending' ? 'Chờ thanh toán' : 'Đã hủy'}
                      </Badge>
                      {getDeliveryStatusBadge(order.delivery_status || 'pending')}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Thông tin khách hàng</h4>
                    <div className="space-y-1 text-sm">
                      <div>Email: {order.buyer_email || 'Chưa có'}</div>
                      {order.buyer_data && Object.keys(order.buyer_data).length > 0 && (
                        <div>
                          <div className="font-medium mt-2">Thông tin bổ sung:</div>
                          {Object.entries(order.buyer_data as Record<string, any>).map(([key, value]) => (
                            <div key={key}>{key}: {value}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      Chi tiết
                    </Button>
                    
                    {order.product?.product_type === 'shared_account' && (
                      <Button variant="outline" size="sm">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Liên hệ CSKH
                      </Button>
                    )}
                    
                    {(order.product?.product_type === 'upgrade_account_no_pass' || 
                      order.product?.product_type === 'upgrade_account_with_pass') && (
                      <Button variant="outline" size="sm">
                        <Mail className="h-4 w-4 mr-1" />
                        Gửi thông tin
                      </Button>
                    )}
                  </div>
                </div>
                
                {order.delivery_notes && (
                  <div className="mt-3 p-3 bg-gray-50 rounded">
                    <div className="text-sm font-medium">Ghi chú giao hàng:</div>
                    <div className="text-sm text-gray-600">{order.delivery_notes}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium mb-2">Chưa có đơn hàng nào</h3>
          <p className="text-gray-500">Đơn hàng của khách hàng sẽ xuất hiện ở đây.</p>
        </div>
      )}
    </div>
  );
};

export default SellerOrders;
