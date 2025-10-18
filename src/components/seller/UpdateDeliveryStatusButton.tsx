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
      const { error } = await supabase
        .from('orders')
        .update({
          delivery_status: status,
          delivery_notes: notes || currentNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;
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
