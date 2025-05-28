
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ManualConfirmationProps {
  showManualButton: boolean;
  onManualConfirmation: () => void;
  orderId: string;
}

const ManualConfirmation = ({ showManualButton, onManualConfirmation, orderId }: ManualConfirmationProps) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleManualConfirmation = async () => {
    setIsProcessing(true);
    
    try {
      console.log('Starting manual payment request for order:', orderId);
      
      // Cập nhật đơn hàng để đánh dấu yêu cầu xác nhận thủ công
      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
          manual_payment_requested: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (updateError) {
        console.error('Error updating order:', updateError);
        throw updateError;
      }

      console.log('Order updated successfully, now fetching order data...');

      // Lấy thông tin đơn hàng và sản phẩm để gửi thông báo
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select(`
          *,
          products (
            id,
            title,
            seller_id,
            seller_name
          )
        `)
        .eq('id', orderId)
        .single();

      if (orderError || !orderData) {
        console.error('Error fetching order data:', orderError);
        throw orderError || new Error('Không tìm thấy thông tin đơn hàng');
      }

      console.log('Order data fetched:', orderData);

      // Tạo thông báo cho admin (sử dụng seller_id thay vì tìm admin riêng)
      const { error: adminNotificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: orderData.products.seller_id, // Thông báo cho seller
          type: 'manual_payment_request',
          title: 'Yêu cầu xác nhận thanh toán thủ công',
          message: `Khách hàng ${orderData.buyer_email} đã yêu cầu xác nhận thanh toán thủ công cho đơn hàng "${orderData.products.title}". Vui lòng kiểm tra và xác nhận.`,
          related_order_id: orderId,
          is_read: false
        });

      if (adminNotificationError) {
        console.error('Error creating admin notification:', adminNotificationError);
        // Không throw error vì đơn hàng đã được cập nhật thành công
      } else {
        console.log('Admin notification created successfully');
      }

      // Tạo thông báo cho buyer
      const { error: buyerNotificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: orderData.user_id,
          type: 'manual_payment_requested',
          title: 'Yêu cầu xác nhận thanh toán đã được gửi',
          message: `Yêu cầu xác nhận thanh toán cho đơn hàng "${orderData.products.title}" đã được gửi đến người bán. Bạn sẽ nhận được thông báo khi thanh toán được xác nhận.`,
          related_order_id: orderId,
          is_read: false
        });

      if (buyerNotificationError) {
        console.error('Error creating buyer notification:', buyerNotificationError);
      } else {
        console.log('Buyer notification created successfully');
      }

      toast.success('Đã gửi yêu cầu xác nhận thủ công. Người bán sẽ xử lý trong ít phút.');
      onManualConfirmation();
    } catch (error) {
      console.error('Error requesting manual confirmation:', error);
      toast.error('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!showManualButton) return null;

  return (
    <div className="pt-4 border-t">
      <Button 
        onClick={handleManualConfirmation}
        disabled={isProcessing}
        className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50"
      >
        {isProcessing ? 'Đang xử lý...' : 'Tôi đã chuyển khoản - Xác nhận thủ công'}
      </Button>
      <p className="text-xs text-gray-500 text-center mt-2">
        Nếu đã chuyển khoản nhưng chưa được xác nhận tự động trong 5 phút, vui lòng bấm nút trên
      </p>
    </div>
  );
};

export default ManualConfirmation;
