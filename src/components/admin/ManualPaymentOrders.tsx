
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { formatPrice, formatDate } from "@/utils/orderUtils";

const ManualPaymentOrders = () => {
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const { data: manualOrders, isLoading, refetch } = useQuery({
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
              seller_id,
              seller_name
            )
          `)
          .eq('manual_payment_requested', true)
          .eq('status', 'pending')
          .order('created_at', { ascending: false });
        
        if (ordersError) {
          console.error('Manual orders fetch error:', ordersError);
          return [];
        }

        console.log('Manual payment orders:', ordersData);
        return ordersData || [];
      } catch (error) {
        console.error('Error fetching manual payment orders:', error);
        return [];
      }
    }
  });

  const handleConfirmPayment = async (orderId: string) => {
    setIsProcessing(orderId);
    console.log('Starting manual payment confirmation for order:', orderId);
    
    try {
      // Lấy thông tin đơn hàng trước khi cập nhật
      const { data: orderData, error: fetchError } = await supabase
        .from('orders')
        .select(`
          *,
          products (
            id,
            title,
            price,
            seller_id,
            product_type
          )
        `)
        .eq('id', orderId)
        .single();

      if (fetchError || !orderData) {
        console.error('Error fetching order data:', fetchError);
        throw fetchError || new Error('Không tìm thấy thông tin đơn hàng');
      }

      console.log('Order data before update:', orderData);

      // Cập nhật trạng thái đơn hàng với logging chi tiết
      console.log('Updating order with ID:', orderId);
      const { data: updateData, error: updateError } = await supabase
        .from('orders')
        .update({ 
          status: 'paid',
          delivery_status: 'pending',
          payment_verified_at: new Date().toISOString(),
          manual_payment_requested: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select();
      
      if (updateError) {
        console.error('Error updating order:', updateError);
        throw updateError;
      }

      console.log('Order updated successfully:', updateData);
      
      // Kiểm tra dữ liệu sau update
      const { data: verifyData, error: verifyError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();
        
      console.log('Order data after update verification:', verifyData);
      if (verifyError) {
        console.error('Error verifying update:', verifyError);
      }

      // Tạo thông báo cho người mua
      const { error: buyerNotificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: orderData.user_id,
          type: 'payment_confirmed',
          title: 'Thanh toán đã được xác nhận',
          message: `Đơn hàng "${orderData.products.title}" đã được xác nhận thanh toán thành công. Chúng tôi sẽ tiến hành giao hàng sớm nhất.`,
          related_order_id: orderId,
          is_read: false
        });

      if (buyerNotificationError) {
        console.error('Error creating buyer notification:', buyerNotificationError);
      } else {
        console.log('Buyer notification created successfully');
      }

      // Tạo thông báo cho seller về đơn hàng mới cần xử lý
      const { error: sellerNotificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: orderData.products.seller_id,
          type: 'new_paid_order',
          title: 'Đơn hàng mới cần xử lý',
          message: `Đơn hàng "${orderData.products.title}" đã được thanh toán và cần giao hàng. Vui lòng vào phần quản lý đơn hàng để xử lý.`,
          related_order_id: orderId,
          is_read: false
        });

      if (sellerNotificationError) {
        console.error('Error creating seller notification:', sellerNotificationError);
      } else {
        console.log('Seller notification created successfully');
      }
      
      toast.success('Đã xác nhận thanh toán thành công');
      
      // Force refetch to update the UI
      console.log('Triggering refetch...');
      await refetch();
      
    } catch (error) {
      console.error('Error confirming payment:', error);
      toast.error('Có lỗi xảy ra khi xác nhận thanh toán');
    } finally {
      setIsProcessing(null);
    }
  };

  const handleRejectPayment = async (orderId: string) => {
    setIsProcessing(orderId);
    console.log('Starting manual payment rejection for order:', orderId);
    
    try {
      // Lấy thông tin đơn hàng
      const { data: orderData, error: fetchError } = await supabase
        .from('orders')
        .select(`
          *,
          products (title)
        `)
        .eq('id', orderId)
        .single();

      if (fetchError || !orderData) {
        console.error('Error fetching order data:', fetchError);
        throw fetchError || new Error('Không tìm thấy thông tin đơn hàng');
      }

      console.log('Order data before rejection:', orderData);

      // Cập nhật đơn hàng
      const { data: updateData, error: updateError } = await supabase
        .from('orders')
        .update({ 
          manual_payment_requested: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select();
      
      if (updateError) {
        console.error('Error updating order:', updateError);
        throw updateError;
      }

      console.log('Order rejection updated successfully:', updateData);

      // Thông báo cho người mua
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: orderData.user_id,
          type: 'payment_rejected',
          title: 'Yêu cầu xác nhận thanh toán bị từ chối',
          message: `Yêu cầu xác nhận thanh toán cho đơn hàng "${orderData.products.title}" đã bị từ chối. Vui lòng kiểm tra lại thông tin chuyển khoản hoặc liên hệ hỗ trợ.`,
          related_order_id: orderId,
          is_read: false
        });

      if (notificationError) {
        console.error('Error creating rejection notification:', notificationError);
      } else {
        console.log('Rejection notification created successfully');
      }
      
      toast.success('Đã từ chối yêu cầu xác nhận');
      
      // Force refetch to update the UI
      await refetch();
      
    } catch (error) {
      console.error('Error rejecting payment:', error);
      toast.error('Có lỗi xảy ra khi từ chối yêu cầu');
    } finally {
      setIsProcessing(null);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-marketplace-primary"></div>
    </div>;
  }

  if (!manualOrders || manualOrders.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium mb-2">Không có đơn hàng cần xác nhận thủ công</h3>
        <p className="text-gray-500">Tất cả đơn hàng đã được xử lý tự động</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Đơn hàng chờ xác nhận thủ công ({manualOrders.length})</h3>
      
      {manualOrders.map((order) => (
        <Card key={order.id} className="border-orange-200">
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
                    onClick={() => handleConfirmPayment(order.id)}
                    disabled={isProcessing === order.id}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 text-sm"
                  >
                    {isProcessing === order.id ? 'Đang xử lý...' : 'Xác nhận'}
                  </Button>
                  <Button
                    onClick={() => handleRejectPayment(order.id)}
                    disabled={isProcessing === order.id}
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
      ))}
    </div>
  );
};

export default ManualPaymentOrders;
