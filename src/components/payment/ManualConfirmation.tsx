
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
      const { error } = await supabase
        .from('orders')
        .update({ 
          manual_payment_requested: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) {
        throw error;
      }

      toast.success('Đã gửi yêu cầu xác nhận thủ công. Admin sẽ xử lý trong ít phút.');
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
