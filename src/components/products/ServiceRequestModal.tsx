import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ServiceRequestModalProps {
  open: boolean;
  onClose: () => void;
  product: {
    id: string;
    title: string;
    seller_id: string;
    delivery_data?: any;
  };
  onSuccess: (conversationId: string) => void;
}

interface FormField {
  name: string;
  label: string;
  type: string;
  required: boolean;
}

const ServiceRequestModal = ({ open, onClose, product, onSuccess }: ServiceRequestModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [existingTicket, setExistingTicket] = useState<any>(null);
  const [checkingExisting, setCheckingExisting] = useState(true);

  // Check for existing active ticket when modal opens
  useEffect(() => {
    const checkExistingTicket = async () => {
      if (!open) return;
      
      setCheckingExisting(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('service_tickets')
          .select('id, status, conversation_id')
          .eq('buyer_id', user.id)
          .eq('product_id', product.id)
          .in('status', ['pending', 'quoted', 'accepted', 'in_progress'])
          .maybeSingle();

        if (!error && data) {
          setExistingTicket(data);
        } else {
          setExistingTicket(null);
        }
      } catch (error) {
        console.error('Error checking existing ticket:', error);
      } finally {
        setCheckingExisting(false);
      }
    };

    checkExistingTicket();
  }, [open, product.id]);

  // Parse form template from product delivery_data
  const formFields: FormField[] = product.delivery_data?.service_form_fields || [
    { name: "issue_description", label: "Mô tả vấn đề", type: "textarea", required: true },
    { name: "contact_info", label: "Thông tin liên hệ (Email/SĐT)", type: "text", required: true }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const missingFields = formFields.filter(f => f.required && !formData[f.name]);
    if (missingFields.length > 0) {
      toast({
        title: "Thiếu thông tin",
        description: `Vui lòng điền: ${missingFields.map(f => f.label).join(", ")}`,
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Vui lòng đăng nhập");

      const { data, error } = await supabase.functions.invoke('create-service-ticket', {
        body: {
          productId: product.id,
          sellerId: product.seller_id,
          title: `Yêu cầu: ${product.title}`,
          description: formData.issue_description || "",
          requestData: formData
        }
      });

      if (error) {
        // Check if it's an existing ticket error
        if (error.message && typeof error.message === 'string' && error.message.includes('đang xử lý')) {
          toast({
            title: "Đã có yêu cầu dịch vụ",
            description: error.message,
            variant: "default"
          });
          
          // Try to extract conversationId from error context
          const context = (error as any).context;
          if (context?.existingConversationId) {
            onSuccess(context.existingConversationId);
          }
          onClose();
          return;
        }
        throw error;
      }

      toast({
        title: "Yêu cầu đã được gửi",
        description: "Người bán sẽ sớm phản hồi báo giá cho bạn"
      });

      onSuccess(data.conversationId);
      onClose();
    } catch (error: any) {
      console.error('Error creating service ticket:', error);
      toast({
        title: "Có lỗi xảy ra",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Yêu cầu dịch vụ</DialogTitle>
          <DialogDescription>
            Điền thông tin chi tiết để người bán có thể báo giá chính xác
          </DialogDescription>
        </DialogHeader>

        {checkingExisting ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : existingTicket ? (
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Bạn đã có yêu cầu dịch vụ đang xử lý cho sản phẩm này. Vui lòng kiểm tra trong chat.
              </AlertDescription>
            </Alert>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Đóng
              </Button>
              <Button onClick={() => {
                onSuccess(existingTicket.conversation_id);
                onClose();
              }}>
                Mở Chat
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
          {formFields.map((field) => (
            <div key={field.name} className="space-y-2">
              <Label htmlFor={field.name}>
                {field.label} {field.required && <span className="text-destructive">*</span>}
              </Label>
              {field.type === 'textarea' ? (
                <Textarea
                  id={field.name}
                  value={formData[field.name] || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
                  placeholder={`Nhập ${field.label.toLowerCase()}`}
                  rows={4}
                  required={field.required}
                />
              ) : (
                <Input
                  id={field.name}
                  type={field.type}
                  value={formData[field.name] || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
                  placeholder={`Nhập ${field.label.toLowerCase()}`}
                  required={field.required}
                />
              )}
            </div>
          ))}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Gửi yêu cầu
            </Button>
          </DialogFooter>
        </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ServiceRequestModal;
