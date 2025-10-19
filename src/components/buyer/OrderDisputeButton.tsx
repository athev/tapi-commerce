
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface OrderDisputeButtonProps {
  orderId: string;
  status: string;
  deliveryStatus?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
}

const OrderDisputeButton = ({ 
  orderId, 
  status, 
  deliveryStatus, 
  variant = "outline",
  size = "default" 
}: OrderDisputeButtonProps) => {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const disputeOrderMutation = useMutation({
    mutationFn: async () => {
      console.log('Creating dispute for order:', orderId);
      
      // Get order info first
      const { data: order } = await supabase
        .from('orders')
        .select('user_id, product_id')
        .eq('id', orderId)
        .single();
      
      // Create dispute record
      const { error } = await supabase
        .from('order_disputes')
        .insert({
          order_id: orderId,
          reason,
          description,
          status: 'pending'
        });

      if (error) {
        console.error('Error creating dispute:', error);
        throw error;
      }

      // Update order status to disputed
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          delivery_status: 'disputed',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (updateError) {
        console.error('Error updating order status:', updateError);
        throw updateError;
      }

      // Get product and seller info for notifications
      if (order) {
        const { data: product } = await supabase
          .from('products')
          .select('seller_id, title')
          .eq('id', order.product_id)
          .single();

        // Create notification for buyer
        await supabase.from('notifications').insert({
          user_id: order.user_id,
          type: 'dispute_created',
          title: 'Đã tạo tranh chấp',
          message: 'Yêu cầu tranh chấp của bạn đã được gửi. Admin sẽ xử lý trong 24-48h.',
          priority: 'high',
          action_url: '/my-purchases',
          related_order_id: orderId
        });

        // Create notification for seller
        if (product) {
          await supabase.from('notifications').insert({
            user_id: product.seller_id,
            type: 'dispute_from_buyer',
            title: '⚠️ Có tranh chấp mới',
            message: `Khách hàng đã tạo tranh chấp cho đơn hàng "${product.title}".`,
            priority: 'high',
            action_url: '/seller',
            related_order_id: orderId
          });
        }
      }
    },
    onSuccess: () => {
      toast({
        title: "Khiếu nại đã gửi",
        description: "Khiếu nại của bạn đã được gửi và sẽ được xem xét",
      });
      
      setOpen(false);
      setReason("");
      setDescription("");
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['user-purchases'] });
    },
    onError: (error) => {
      console.error('Dispute order error:', error);
      toast({
        title: "Lỗi gửi khiếu nại",
        description: "Có lỗi xảy ra khi gửi khiếu nại",
        variant: "destructive",
      });
    }
  });

  // Show button only for paid orders within dispute timeframe
  const shouldShow = status === 'paid' && 
                    deliveryStatus !== 'completed' && 
                    deliveryStatus !== 'disputed';

  if (!shouldShow) return null;

  const handleSubmit = () => {
    if (!reason || !description.trim()) {
      toast({
        title: "Thông tin không đầy đủ",
        description: "Vui lòng chọn lý do và mô tả khiếu nại",
        variant: "destructive",
      });
      return;
    }
    disputeOrderMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size}>
          <AlertTriangle className="h-4 w-4 mr-2" />
          Khiếu nại
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Khiếu nại đơn hàng</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="reason">Lý do khiếu nại</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn lý do khiếu nại" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="not_received">Chưa nhận được hàng</SelectItem>
                <SelectItem value="wrong_product">Sản phẩm không đúng mô tả</SelectItem>
                <SelectItem value="defective">Sản phẩm lỗi</SelectItem>
                <SelectItem value="incomplete">Thiếu file/link tải</SelectItem>
                <SelectItem value="other">Lý do khác</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="description">Mô tả chi tiết</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả chi tiết vấn đề bạn gặp phải..."
              rows={4}
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={disputeOrderMutation.isPending}
            >
              {disputeOrderMutation.isPending ? 'Đang gửi...' : 'Gửi khiếu nại'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDisputeButton;
