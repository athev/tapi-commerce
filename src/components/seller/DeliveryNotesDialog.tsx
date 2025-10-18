import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface DeliveryNotesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (notes: string) => void;
  currentNotes?: string;
  status: string;
  isLoading?: boolean;
}

const DeliveryNotesDialog = ({
  open,
  onOpenChange,
  onSubmit,
  currentNotes = "",
  status,
  isLoading = false,
}: DeliveryNotesDialogProps) => {
  const [notes, setNotes] = useState(currentNotes);

  useEffect(() => {
    if (open) {
      setNotes(currentNotes);
    }
  }, [open, currentNotes]);

  const handleSubmit = () => {
    onSubmit(notes);
  };

  const getTitle = () => {
    switch (status) {
      case 'delivered':
        return 'Xác nhận đã giao hàng';
      case 'failed':
        return 'Báo cáo giao hàng thất bại';
      default:
        return 'Cập nhật ghi chú';
    }
  };

  const getPlaceholder = () => {
    switch (status) {
      case 'delivered':
        return 'Ví dụ: Đã gửi license key qua email, Đã nâng cấp tài khoản thành công...';
      case 'failed':
        return 'Vui lòng mô tả lý do thất bại...';
      default:
        return 'Nhập ghi chú giao hàng...';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="notes">
              Ghi chú {status === 'failed' && <span className="text-red-500">*</span>}
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={getPlaceholder()}
              rows={5}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Khách hàng có thể xem ghi chú này
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || (status === 'failed' && !notes.trim())}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Đang lưu...
              </>
            ) : (
              'Xác nhận'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeliveryNotesDialog;
