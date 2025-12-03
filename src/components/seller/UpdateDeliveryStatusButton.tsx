import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import DeliveryNotesDialog from "./DeliveryNotesDialog";
import { Package, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UpdateDeliveryStatusButtonProps {
  orderId: string;
  currentStatus: string;
  currentNotes?: string;
}

const UpdateDeliveryStatusButton = ({ 
  orderId, 
  currentStatus,
  currentNotes 
}: UpdateDeliveryStatusButtonProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async ({ status, notes }: { status: string; notes?: string }) => {
      // Get order info first
      const { data: order } = await supabase
        .from('orders')
        .select('user_id, product_id')
        .eq('id', orderId)
        .single();

      const { error } = await supabase
        .from('orders')
        .update({
          delivery_status: status,
          delivery_notes: notes || currentNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;

      // Create notification for buyer about delivery status update
      if (order) {
        const { data: product } = await supabase
          .from('products')
          .select('title')
          .eq('id', order.product_id)
          .single();

        // Send different notification based on status
        if (status === 'delivered') {
          // Special notification for delivered status - prompt buyer to confirm completion
          await supabase.from('notifications').insert({
            user_id: order.user_id,
            type: 'order_delivered',
            title: 'Đơn hàng đã được giao',
            message: `Đơn hàng "${product?.title || 'Sản phẩm'}" đã được giao. Vui lòng xác nhận hoàn thành để nhận sản phẩm và được cộng PI!`,
            priority: 'high',
            action_url: '/my-purchases',
            related_order_id: orderId
          });
        } else {
          // Generic notification for other status updates
          const statusLabels: Record<string, string> = {
            'pending': 'Chờ xử lý',
            'processing': 'Đang xử lý',
            'completed': 'Hoàn thành',
            'failed': 'Thất bại'
          };

          await supabase.from('notifications').insert({
            user_id: order.user_id,
            type: 'delivery_status_updated',
            title: 'Cập nhật trạng thái đơn hàng',
            message: `Đơn hàng "${product?.title || 'Sản phẩm'}" đã được cập nhật: ${statusLabels[status] || status}`,
            priority: 'normal',
            action_url: '/my-purchases',
            related_order_id: orderId
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-orders'] });
      toast({
        title: "Đã cập nhật",
        description: "Trạng thái giao hàng đã được cập nhật",
      });
      setDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật trạng thái: " + error.message,
        variant: "destructive",
      });
    }
  });

  const handleStatusSelect = (status: string) => {
    setSelectedStatus(status);
    // For processing, update immediately without notes
    if (status === 'processing') {
      updateMutation.mutate({ status });
    } else {
      // For delivered/failed, show dialog to add notes
      setDialogOpen(true);
    }
  };

  const handleNotesSubmit = (notes: string) => {
    updateMutation.mutate({ status: selectedStatus, notes });
  };

  const statusOptions = [
    { value: 'processing', label: 'Đang xử lý', disabled: currentStatus === 'processing' || currentStatus === 'delivered' },
    { value: 'delivered', label: 'Đã giao hàng', disabled: currentStatus === 'delivered' },
    { value: 'failed', label: 'Thất bại', disabled: currentStatus === 'delivered' },
  ];

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="default" 
            size="default"
            disabled={updateMutation.isPending || currentStatus === 'delivered'}
          >
            {updateMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Package className="h-4 w-4 mr-2" />
            )}
            Cập nhật trạng thái
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {statusOptions.map((option) => (
            <DropdownMenuItem
              key={option.value}
              disabled={option.disabled}
              onClick={() => handleStatusSelect(option.value)}
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DeliveryNotesDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleNotesSubmit}
        currentNotes={currentNotes}
        status={selectedStatus}
        isLoading={updateMutation.isPending}
      />
    </>
  );
};

export default UpdateDeliveryStatusButton;
