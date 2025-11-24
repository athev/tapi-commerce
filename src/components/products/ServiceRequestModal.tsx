import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

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

      if (error) throw error;

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
      </DialogContent>
    </Dialog>
  );
};

export default ServiceRequestModal;
