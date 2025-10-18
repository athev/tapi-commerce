import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface WithdrawalFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availablePI: number;
  onSuccess: () => void;
}

const VIETNAMESE_BANKS = [
  "Vietcombank", "BIDV", "VietinBank", "Agribank", "Techcombank",
  "MB Bank", "ACB", "VPBank", "Sacombank", "TPBank",
  "HDBank", "SHB", "VIB", "OCB", "MSB"
];

const WithdrawalForm = ({ open, onOpenChange, availablePI, onSuccess }: WithdrawalFormProps) => {
  const [loading, setLoading] = useState(false);
  const [piAmount, setPiAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");

  const vndAmount = parseFloat(piAmount || "0") * 1000;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amount = parseFloat(piAmount);

    // Validation
    if (!amount || amount < 100) {
      toast.error("Số tiền rút tối thiểu là 100 PI");
      return;
    }

    if (amount > availablePI) {
      toast.error(`Số dư không đủ. Bạn chỉ có ${availablePI} PI khả dụng`);
      return;
    }

    if (!bankName || !accountNumber || !accountName) {
      toast.error("Vui lòng điền đầy đủ thông tin ngân hàng");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('submit-withdrawal', {
        body: {
          pi_amount: amount,
          bank_name: bankName,
          bank_account_number: accountNumber,
          bank_account_name: accountName
        }
      });

      if (error) throw error;

      if (data.success) {
        toast.success("Yêu cầu rút tiền đã được gửi thành công!");
        onOpenChange(false);
        onSuccess();
        // Reset form
        setPiAmount("");
        setBankName("");
        setAccountNumber("");
        setAccountName("");
      } else {
        throw new Error(data.error || "Failed to submit withdrawal");
      }
    } catch (error: any) {
      console.error("Withdrawal error:", error);
      toast.error(error.message || "Có lỗi xảy ra khi gửi yêu cầu rút tiền");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Rút tiền về tài khoản ngân hàng</DialogTitle>
          <DialogDescription>
            Số dư khả dụng: <span className="font-bold text-primary">{availablePI.toLocaleString('vi-VN')} PI</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Số tiền rút (PI) *</Label>
            <Input
              id="amount"
              type="number"
              min="100"
              max={availablePI}
              value={piAmount}
              onChange={(e) => setPiAmount(e.target.value)}
              placeholder="Tối thiểu 100 PI"
              required
            />
            {piAmount && (
              <p className="text-sm text-muted-foreground">
                Tương đương: {vndAmount.toLocaleString('vi-VN')} VND
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bank">Ngân hàng *</Label>
            <Select value={bankName} onValueChange={setBankName} required>
              <SelectTrigger>
                <SelectValue placeholder="Chọn ngân hàng" />
              </SelectTrigger>
              <SelectContent>
                {VIETNAMESE_BANKS.map((bank) => (
                  <SelectItem key={bank} value={bank}>
                    {bank}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountNumber">Số tài khoản *</Label>
            <Input
              id="accountNumber"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="Nhập số tài khoản"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountName">Tên chủ tài khoản *</Label>
            <Input
              id="accountName"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="Nhập tên chủ tài khoản"
              required
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Xác nhận rút tiền
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default WithdrawalForm;