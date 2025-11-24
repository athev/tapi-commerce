import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, DollarSign, Clock } from "lucide-react";

interface ServiceQuoteModalProps {
  open: boolean;
  onClose: () => void;
  ticketId: string;
  onSuccess: () => void;
}

const ServiceQuoteModal = ({ open, onClose, ticketId, onSuccess }: ServiceQuoteModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [quotedPrice, setQuotedPrice] = useState("");
  const [estimatedDays, setEstimatedDays] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const price = parseInt(quotedPrice);
    const days = parseInt(estimatedDays);

    if (!price || price < 0) {
      toast({
        title: "Giá không hợp lệ",
        description: "Vui lòng nhập giá hợp lệ",
        variant: "destructive"
      });
      return;
    }

    if (!days || days < 0) {
      toast({
        title: "Thời gian không hợp lệ",
        description: "Vui lòng nhập thời gian ước tính",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('send-service-quote', {
        body: {
          ticketId,
          quotedPrice: price,
          estimatedDays: days,
          notes: notes || ""
        }
      });

      if (error) throw error;

      toast({
        title: "Báo giá thành công",
        description: "Khách hàng sẽ nhận được thông báo"
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error sending quote:', error);
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
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Gửi báo giá</DialogTitle>
          <DialogDescription>
            Nhập thông tin báo giá cho khách hàng
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="price">
              <DollarSign className="inline h-4 w-4 mr-1" />
              Giá dịch vụ (VND) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="price"
              type="number"
              value={quotedPrice}
              onChange={(e) => setQuotedPrice(e.target.value)}
              placeholder="Ví dụ: 500000"
              min="0"
              step="1000"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="days">
              <Clock className="inline h-4 w-4 mr-1" />
              Thời gian ước tính (ngày) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="days"
              type="number"
              value={estimatedDays}
              onChange={(e) => setEstimatedDays(e.target.value)}
              placeholder="Ví dụ: 3"
              min="1"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Ghi chú chi tiết</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Mô tả chi tiết về dịch vụ, yêu cầu thêm, điều kiện..."
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Gửi báo giá
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceQuoteModal;
