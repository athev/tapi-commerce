
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
      console.log('Confirming order completion:', orderId);
      
      // Update order status to completed
      const { error: orderError } = await supabase
        .from('orders')
        .update({
          delivery_status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (orderError) {
        console.error('Error confirming order:', orderError);
        throw new Error(`Không thể cập nhật đơn hàng: ${orderError.message}`);
      }

      // Call edge function to process early PI release
      try {
        const { error: releaseError } = await supabase.functions.invoke('release-pi-early', {
          body: { orderId }
        });

        if (releaseError) {
          console.error('Error releasing PI early:', releaseError);
          // Don't throw here as the order update was successful
          console.log('Order confirmed but PI release may have issues');
        }
      } catch (error) {
        console.error('Edge function error:', error);
        // Continue as order confirmation is still valid
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

  // Show button only for paid orders that are not completed yet
  const shouldShow = status === 'paid' && 
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
