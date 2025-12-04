import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Loader2, Clock, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { calculateWarrantyExpiry } from "@/utils/warrantyUtils";

interface WarrantyClaimModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: {
    id: string;
    product_id: string;
    payment_verified_at?: string | null;
  };
  product: {
    id: string;
    title: string;
    seller_id: string;
    warranty_period?: string | null;
  };
  onSuccess?: (conversationId: string) => void;
}

const CLAIM_TYPES = [
  { value: 'repair', label: '🔧 Sửa lỗi', description: 'Sản phẩm gặp lỗi, cần được sửa chữa' },
  { value: 'replace', label: '🔄 Thay thế', description: 'Yêu cầu thay thế sản phẩm mới' },
  { value: 'refund', label: '💰 Hoàn tiền', description: 'Yêu cầu hoàn lại tiền' },
];

const WarrantyClaimModal = ({ 
  open, 
  onOpenChange, 
  order, 
  product,
  onSuccess 
}: WarrantyClaimModalProps) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [claimType, setClaimType] = useState('repair');

  const warrantyExpiresAt = calculateWarrantyExpiry(
    order.payment_verified_at || new Date().toISOString(),
    product.warranty_period
  );

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để gửi yêu cầu bảo hành');
      return;
    }

    if (!title.trim()) {
      toast.error('Vui lòng nhập tiêu đề yêu cầu');
      return;
    }

    if (!description.trim()) {
      toast.error('Vui lòng mô tả chi tiết vấn đề');
      return;
    }

    setIsSubmitting(true);

    try {
      // Check for existing active warranty claim
      const { data: existingClaim } = await supabase
        .from('warranty_claims')
        .select('id, conversation_id')
        .eq('order_id', order.id)
        .in('status', ['pending', 'in_progress'])
        .single();

      if (existingClaim) {
        toast.error('Bạn đã có yêu cầu bảo hành đang xử lý cho đơn hàng này');
        if (existingClaim.conversation_id && onSuccess) {
          onSuccess(existingClaim.conversation_id);
        }
        onOpenChange(false);
        return;
      }

      // Create or find existing warranty conversation
      let conversationId: string;

      const { data: existingConversation } = await supabase
        .from('conversations')
        .select('id')
        .eq('buyer_id', user.id)
        .eq('seller_id', product.seller_id)
        .eq('order_id', order.id)
        .eq('chat_type', 'warranty_claim')
        .single();

      if (existingConversation) {
        conversationId = existingConversation.id;
      } else {
        const { data: newConversation, error: convError } = await supabase
          .from('conversations')
          .insert({
            buyer_id: user.id,
            seller_id: product.seller_id,
            order_id: order.id,
            product_id: product.id,
            chat_type: 'warranty_claim',
          })
          .select()
          .single();

        if (convError) throw convError;
        conversationId = newConversation.id;
      }

      // Create warranty claim
      const { data: claim, error: claimError } = await supabase
        .from('warranty_claims')
        .insert({
          order_id: order.id,
          product_id: product.id,
          buyer_id: user.id,
          seller_id: product.seller_id,
          conversation_id: conversationId,
          title: title.trim(),
          description: description.trim(),
          claim_type: claimType,
          warranty_expires_at: warrantyExpiresAt?.toISOString(),
          status: 'pending',
        })
        .select()
        .single();

      if (claimError) throw claimError;

      // Send initial message in conversation
      await supabase.from('messages').insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content: `🛡️ **YÊU CẦU BẢO HÀNH**\n\n**Tiêu đề:** ${title}\n**Loại yêu cầu:** ${CLAIM_TYPES.find(t => t.value === claimType)?.label}\n\n**Mô tả:**\n${description}`,
        message_type: 'text',
      });

      // Create notification for seller
      await supabase.from('notifications').insert({
        user_id: product.seller_id,
        type: 'warranty_claim',
        title: '🛡️ Yêu cầu bảo hành mới',
        message: `Khách hàng yêu cầu bảo hành cho sản phẩm "${product.title}". Bạn cần xử lý trong 24 giờ.`,
        priority: 'high',
        action_url: `/chat/${conversationId}`,
        related_order_id: order.id,
        metadata: {
          claim_id: claim.id,
          claim_type: claimType,
        },
      });

      toast.success('Đã gửi yêu cầu bảo hành thành công!', {
        description: 'Người bán sẽ phản hồi trong vòng 24 giờ.',
      });

      onOpenChange(false);
      
      if (onSuccess) {
        onSuccess(conversationId);
      }
    } catch (error) {
      console.error('Error creating warranty claim:', error);
      toast.error('Không thể gửi yêu cầu bảo hành. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Yêu cầu bảo hành
          </DialogTitle>
          <DialogDescription>
            Sản phẩm: {product.title}
          </DialogDescription>
        </DialogHeader>

        <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
          <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-700 dark:text-blue-300">
            Người bán sẽ phản hồi trong vòng <strong>24 giờ</strong>. Bạn có thể thương lượng gia hạn thời gian xử lý nếu cần.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Loại yêu cầu *</Label>
            <RadioGroup value={claimType} onValueChange={setClaimType}>
              {CLAIM_TYPES.map((type) => (
                <label
                  key={type.value}
                  className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-accent/50 has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                >
                  <RadioGroupItem value={type.value} className="mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">{type.label}</p>
                    <p className="text-xs text-muted-foreground">{type.description}</p>
                  </div>
                </label>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Tiêu đề yêu cầu *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Không thể kích hoạt phần mềm"
              maxLength={100}
            />
            <p className="text-xs text-muted-foreground text-right">{title.length}/100</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Mô tả chi tiết vấn đề *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả chi tiết vấn đề bạn gặp phải, các bước bạn đã thử..."
              rows={4}
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground text-right">{description.length}/1000</p>
          </div>

          <Alert variant="destructive" className="bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Vui lòng cung cấp thông tin chính xác và đầy đủ. Yêu cầu không hợp lệ có thể bị từ chối.
            </AlertDescription>
          </Alert>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1"
              disabled={isSubmitting || !title.trim() || !description.trim()}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang gửi...
                </>
              ) : (
                'Gửi yêu cầu'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WarrantyClaimModal;
