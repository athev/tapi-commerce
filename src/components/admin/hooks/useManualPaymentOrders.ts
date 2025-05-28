
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { fetchManualPaymentOrders, confirmManualPayment, rejectManualPayment } from "../utils/manualPaymentApi";

export const useManualPaymentOrders = () => {
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const { data: manualOrders, isLoading, refetch } = useQuery({
    queryKey: ['manual-payment-orders'],
    queryFn: fetchManualPaymentOrders
  });

  const handleConfirmPayment = async (orderId: string) => {
    setIsProcessing(orderId);
    
    try {
      await confirmManualPayment(orderId);
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
    
    try {
      await rejectManualPayment(orderId);
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

  return {
    manualOrders,
    isLoading,
    isProcessing,
    handleConfirmPayment,
    handleRejectPayment
  };
};
