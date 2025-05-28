
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
      // Cập nhật đơn hàng để đánh dấu yêu cầu xác nhận thủ công
      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
          manual_payment_requested: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (updateError) {
        throw updateError;
      }

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
        throw orderError || new Error('Không tìm thấy thông tin đơn hàng');
      }

      // Tạo thông báo cho seller
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: orderData.products.seller_id,
          type: 'manual_payment_request',
          title: 'Yêu cầu xác nhận thanh toán thủ công',
          message: `Khách hàng ${orderData.buyer_email} đã yêu cầu xác nhận thanh toán thủ công cho đơn hàng ${orderData.products.title}. Vui lòng kiểm tra và xác nhận.`,
          related_order_id: orderId,
          is_read: false
        });

      if (notificationError) {
        console.error('Error creating notification:', notificationError);
        // Không throw error vì đơn hàng đã được cập nhật thành công
      }

      toast.success('Đã gửi yêu cầu xác nhận thủ công. Seller sẽ xử lý trong ít phút.');
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
