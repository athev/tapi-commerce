
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Clock } from "lucide-react";
import { toast } from "sonner";

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

const ManualPaymentOrders = () => {
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  
  const { data: orders, isLoading, refetch } = useQuery({
    queryKey: ['manual-payment-orders'],
    queryFn: async () => {
      try {
        console.log('Fetching manual payment orders...');
        
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select(`
            *,
            products (
              id,
              title,
              price,
              image,
              seller_name
            )
          `)
          .eq('manual_payment_requested', true)
          .eq('status', 'pending')
          .order('updated_at', { ascending: false });
        
        if (ordersError) {
          console.error('Manual payment orders fetch error:', ordersError);
          return [];
        }

        console.log('Manual payment orders:', ordersData);
        return ordersData || [];
      } catch (error) {
        console.error('Error fetching manual payment orders:', error);
        return [];
      }
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const handleApprovePayment = async (orderId: string) => {
    setIsUpdating(orderId);
    
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: 'paid',
          delivery_status: 'pending',
          payment_verified_at: new Date().toISOString(),
          manual_payment_requested: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);
      
      if (error) throw error;
      
      toast.success('Đã xác nhận thanh toán thành công');
      refetch();
    } catch (error) {
      console.error('Error approving payment:', error);
      toast.error('Có lỗi xảy ra khi xác nhận thanh toán');
    } finally {
      setIsUpdating(null);
    }
  };

  const handleRejectPayment = async (orderId: string) => {
    setIsUpdating(orderId);
    
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          manual_payment_requested: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);
      
      if (error) throw error;
      
      toast.success('Đã từ chối yêu cầu xác nhận thanh toán');
      refetch();
    } catch (error) {
      console.error('Error rejecting payment:', error);
      toast.error('Có lỗi xảy ra khi từ chối thanh toán');
    } finally {
      setIsUpdating(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-marketplace-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <CardHeader className="px-0">
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-orange-500" />
          Đơn hàng chờ xác nhận thủ công
          {orders && orders.length > 0 && (
            <Badge variant="secondary" className="bg-orange-100 text-orange-700">
              {orders.length} đơn
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      {orders && orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="border-l-4 border-l-orange-400">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="h-16 w-16 bg-gray-100 rounded overflow-hidden shrink-0">
                    <img 
                      src={order.products?.image || '/placeholder.svg'} 
                      alt={order.products?.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="font-medium">{order.products?.title}</div>
                    <div className="text-sm text-gray-500 space-y-1">
                      <div>Mã đơn hàng: <code className="bg-gray-100 px-1 rounded">{order.id.substring(0, 8).toUpperCase()}</code></div>
                      <div>Email khách hàng: <span className="font-medium">{order.buyer_email || 'Chưa có'}</span></div>
                      <div>Người bán: {order.products?.seller_name}</div>
                      <div>Yêu cầu lúc: {formatDate(order.updated_at)}</div>
                    </div>
                  </div>
                  
                  <div className="text-right space-y-3">
                    <div className="font-medium text-lg text-marketplace-primary">
                      {formatPrice(order.products?.price || 0)}
                    </div>
                    
                    <div className="flex space-x-2 justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600 border-green-600 hover:bg-green-50"
                        disabled={isUpdating === order.id}
                        onClick={() => handleApprovePayment(order.id)}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Đã thanh toán
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-600 hover:bg-red-50"
                        disabled={isUpdating === order.id}
                        onClick={() => handleRejectPayment(order.id)}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Từ chối
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Không có đơn hàng chờ xác nhận</h3>
          <p className="text-gray-500">Tất cả đơn hàng đều được thanh toán tự động hoặc đã được xử lý</p>
        </div>
      )}
    </div>
  );
};

export default ManualPaymentOrders;
