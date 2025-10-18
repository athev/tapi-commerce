
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Order, Product } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import ManualPaymentOrders from "./ManualPaymentOrders";

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

const AdminOrders = () => {
  const [filter, setFilter] = useState("all");
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  
  const { data: orders, isLoading, refetch } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      try {
        console.log('Fetching admin orders...');
        
        // First get orders
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (ordersError) {
          console.error('Orders fetch error:', ordersError);
          return [];
        }

        if (!ordersData || ordersData.length === 0) {
          console.log('No orders found');
          return [];
        }

        // Then get products for these orders
        const productIds = ordersData.map(order => order.product_id);
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .in('id', productIds);

        if (productsError) {
          console.error('Products fetch error:', productsError);
          return [];
        }

        // Combine orders with products
        const ordersWithProducts = ordersData.map(order => {
          const product = productsData?.find(p => p.id === order.product_id);
          return {
            ...order,
            product: product || null
          };
        }).filter(order => order.product !== null);

        console.log('Orders with products:', ordersWithProducts);
        return ordersWithProducts as (Order & { product: Product })[];
      } catch (error) {
        console.error('Error fetching admin orders:', error);
        return [];
      }
    }
  });

  const filteredOrders = orders?.filter(order => {
    if (filter === "all") return true;
    return order.status === filter;
  });

  const handleUpdateStatus = async (orderId: string, newStatus: 'pending' | 'paid' | 'cancelled') => {
    setIsUpdating(orderId);
    
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId);
      
      if (error) throw error;
      
      toast.success('Cập nhật trạng thái thành công');
      refetch();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Có lỗi xảy ra khi cập nhật trạng thái');
    } finally {
      setIsUpdating(null);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-marketplace-primary"></div>
    </div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Quản lý đơn hàng</h2>
      
      <Tabs defaultValue="all-orders" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all-orders">Tất cả đơn hàng</TabsTrigger>
          <TabsTrigger value="manual-payment">Chờ xác nhận thủ công</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all-orders" className="space-y-6">
          <div className="flex justify-end">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Lọc theo trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="pending">Chờ thanh toán</SelectItem>
                <SelectItem value="paid">Đã thanh toán</SelectItem>
                <SelectItem value="cancelled">Đã hủy</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {filteredOrders && filteredOrders.length > 0 ? (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <Card key={order.id}>
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <div className="h-16 w-16 bg-gray-100 rounded overflow-hidden shrink-0">
                        <img 
                          src={order.product.image || '/placeholder.svg'} 
                          alt={order.product.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="flex-1">
                        <div className="font-medium">{order.product.title}</div>
                        <div className="text-sm text-gray-500">
                          Mã đơn hàng: {order.id.substring(0, 8).toUpperCase()} | 
                          Ngày đặt: {formatDate(order.created_at)}
                        </div>
                        {order.manual_payment_requested && (
                          <Badge variant="outline" className="text-orange-600 border-orange-600 mt-1">
                            Yêu cầu xác nhận thủ công
                          </Badge>
                        )}
                      </div>
                      
                      <div className="text-right">
                        <div className="font-medium text-marketplace-primary">
                          {formatPrice(order.product.price)}
                        </div>
                        <div className="mb-2">
                          <Badge className={
                            order.status === 'paid' ? 'bg-green-500' : 
                            order.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                          }>
                            {order.status === 'paid' ? 'Đã thanh toán' : 
                             order.status === 'pending' ? 'Chờ thanh toán' : 'Đã hủy'}
                          </Badge>
                        </div>
                        
                        <div className="flex space-x-2 justify-end">
                          <Select
                            value={order.status}
                            disabled={isUpdating === order.id}
                            onValueChange={(value) => handleUpdateStatus(
                              order.id, 
                              value as 'pending' | 'paid' | 'cancelled'
                            )}
                          >
                            <SelectTrigger className="h-8 text-xs w-32">
                              <SelectValue placeholder="Cập nhật" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Chờ thanh toán</SelectItem>
                              <SelectItem value="paid">Đã thanh toán</SelectItem>
                              <SelectItem value="cancelled">Đã hủy</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium mb-2">Không tìm thấy đơn hàng</h3>
              <p className="text-gray-500">Thử thay đổi bộ lọc hoặc kiểm tra lại sau</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="manual-payment">
          <ManualPaymentOrders />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminOrders;
