
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface OrderConfirmButtonProps {
  orderId: string;
  status: string;
  deliveryStatus?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
}

const OrderConfirmButton = ({ 
  orderId, 
  status, 
  deliveryStatus, 
  variant = "default",
  size = "default" 
}: OrderConfirmButtonProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const confirmOrderMutation = useMutation({
    mutationFn: async () => {
      console.log('[OrderConfirm] Starting confirmation for order:', orderId);
      
      // Update order status to delivered with verification
      console.log('[OrderConfirm] Updating order delivery_status to delivered');
      const { data: updatedOrder, error: orderError } = await supabase
        .from('orders')
        .update({
          delivery_status: 'delivered',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select()
        .single();

      if (orderError || !updatedOrder) {
        console.error('[OrderConfirm] Failed to update order:', orderError);
        throw new Error(`Không thể cập nhật đơn hàng: ${orderError?.message || 'Không tìm thấy đơn hàng'}`);
      }

      console.log('[OrderConfirm] Order updated successfully:', updatedOrder);

      // Call edge function to process early PI release
      console.log('[OrderConfirm] Invoking release-pi-early edge function');
      try {
        const { data: releaseData, error: releaseError } = await supabase.functions.invoke('release-pi-early', {
          body: { orderId }
        });

        console.log('[OrderConfirm] Edge function response:', { data: releaseData, error: releaseError });

        if (releaseError) {
          console.error('[OrderConfirm] Edge function returned error:', releaseError);
          toast({
            title: "Cảnh báo",
            description: "Đã xác nhận đơn nhưng cộng PI gặp vấn đề. Vui lòng liên hệ admin.",
            variant: "destructive",
          });
          return; // Don't throw, order was updated successfully
        }

        if (releaseData && !releaseData.success) {
          console.error('[OrderConfirm] Edge function failed:', releaseData);
          toast({
            title: "Cảnh báo", 
            description: releaseData.message || "Đã xác nhận đơn nhưng cộng PI gặp vấn đề",
            variant: "destructive",
          });
          return;
        }

        console.log('[OrderConfirm] PI released successfully');
        toast({
          title: "Thành công",
          description: "Đã cộng PI cho người bán",
        });
      } catch (error) {
        console.error('[OrderConfirm] Edge function network error:', error);
        toast({
          title: "Cảnh báo",
          description: "Đã xác nhận đơn nhưng không thể kết nối với hệ thống PI",
          variant: "destructive",
        });
      }
    },
    onSuccess: () => {
      toast({
        title: "Xác nhận thành công",
        description: "Đơn hàng đã được xác nhận hoàn thành",
      });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['user-purchases'] });
      queryClient.invalidateQueries({ queryKey: ['seller-orders'] });
      queryClient.invalidateQueries({ queryKey: ['seller-wallet'] });
      queryClient.invalidateQueries({ queryKey: ['wallet-logs'] });
    },
    onError: (error) => {
      console.error('Confirm order error:', error);
      toast({
        title: "Lỗi xác nhận",
        description: error.message || "Có lỗi xảy ra khi xác nhận đơn hàng",
        variant: "destructive",
      });
    }
  });

  // Show button only for paid orders that are not delivered yet
  const shouldShow = status === 'paid' && 
                    deliveryStatus !== 'delivered' && 
                    deliveryStatus !== 'completed' &&
                    deliveryStatus !== 'failed';

  if (!shouldShow) return null;

  return (
    <Button
      onClick={() => confirmOrderMutation.mutate()}
      disabled={confirmOrderMutation.isPending}
      variant={variant}
      size={size}
      className="bg-green-600 hover:bg-green-700"
    >
      <CheckCircle className="h-4 w-4 mr-2" />
      {confirmOrderMutation.isPending ? 'Đang xử lý...' : 'Xác nhận hoàn thành'}
    </Button>
  );
};

export default OrderConfirmButton;
