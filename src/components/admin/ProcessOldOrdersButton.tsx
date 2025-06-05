
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";

const ProcessOldOrdersButton = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleProcessOldOrders = async () => {
    setIsProcessing(true);
    
    try {
      console.log('🔄 Starting old orders processing...');
      
      const { data, error } = await supabase.functions.invoke('process-old-orders');
      
      if (error) {
        console.error('❌ Error calling process-old-orders function:', error);
        toast.error('Lỗi khi xử lý đơn hàng cũ: ' + error.message);
        return;
      }
      
      console.log('✅ Process old orders result:', data);
      
      if (data.success) {
        toast.success(`Đã xử lý thành công ${data.processed} đơn hàng cũ!`);
        console.log(`📊 Summary:
        - Tổng số đơn kiểm tra: ${data.totalChecked}
        - Đơn hàng đã xử lý: ${data.processed}
        - Đơn hàng bỏ qua: ${data.skipped}`);
      } else {
        toast.error('Có lỗi xảy ra: ' + data.error);
      }
      
    } catch (error) {
      console.error('💥 Error in handleProcessOldOrders:', error);
      toast.error('Có lỗi xảy ra khi xử lý đơn hàng cũ');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Button 
      onClick={handleProcessOldOrders}
      disabled={isProcessing}
      variant="outline"
      className="flex items-center space-x-2"
    >
      <RefreshCw className={`h-4 w-4 ${isProcessing ? 'animate-spin' : ''}`} />
      <span>
        {isProcessing ? 'Đang xử lý...' : 'Xử lý đơn hàng cũ'}
      </span>
    </Button>
  );
};

export default ProcessOldOrdersButton;
