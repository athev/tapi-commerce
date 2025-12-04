import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/utils/priceUtils";
import { Send, Loader2, Ticket } from "lucide-react";
import { format } from "date-fns";

interface Voucher {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  min_purchase_amount: number | null;
  max_discount_amount: number | null;
  valid_until: string | null;
  usage_limit: number | null;
  used_count: number | null;
}

interface SendVoucherSheetProps {
  isOpen: boolean;
  onClose: () => void;
  sellerId: string;
  onSendVoucher: (voucher: Voucher, message?: string) => void;
}

const SendVoucherSheet = ({ isOpen, onClose, sellerId, onSendVoucher }: SendVoucherSheetProps) => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (isOpen && sellerId) {
      fetchVouchers();
    }
  }, [isOpen, sellerId]);

  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('vouchers')
        .select('*')
        .eq('created_by', sellerId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Filter valid vouchers
      const validVouchers = (data || []).filter(v => {
        if (v.valid_until && new Date(v.valid_until) < new Date()) return false;
        if (v.usage_limit && v.used_count && v.used_count >= v.usage_limit) return false;
        return true;
      });
      
      setVouchers(validVouchers);
    } catch (error) {
      console.error('Error fetching vouchers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!selectedVoucher) return;
    
    setSending(true);
    try {
      await onSendVoucher(selectedVoucher, message.trim() || undefined);
      setSelectedVoucher(null);
      setMessage("");
      onClose();
    } finally {
      setSending(false);
    }
  };

  const getDiscountText = (voucher: Voucher) => {
    return voucher.discount_type === 'percentage'
      ? `Giảm ${voucher.discount_value}%`
      : `Giảm ${formatPrice(voucher.discount_value)}`;
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[80vh] rounded-t-2xl">
        <SheetHeader className="pb-4">
          <SheetTitle>Gửi mã giảm giá cho khách</SheetTitle>
        </SheetHeader>

        {selectedVoucher ? (
          <div className="flex flex-col h-[calc(100%-60px)]">
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-orange-100 to-red-100 rounded-lg mb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                <Ticket className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-destructive">{getDiscountText(selectedVoucher)}</p>
                <p className="text-sm font-mono">{selectedVoucher.code}</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSelectedVoucher(null)}
              >
                Đổi
              </Button>
            </div>

            <div className="mb-4">
              <label className="text-sm font-medium mb-2 block">Lời nhắn (tuỳ chọn)</label>
              <Input
                placeholder="VD: Voucher dành riêng cho bạn..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={100}
              />
            </div>

            <Button 
              onClick={handleSend} 
              disabled={sending}
              className="mt-auto bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Gửi voucher
            </Button>
          </div>
        ) : (
          <ScrollArea className="h-[calc(100%-60px)]">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : vouchers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Chưa có voucher nào
              </div>
            ) : (
              <div className="space-y-2">
                {vouchers.map((voucher) => (
                  <div
                    key={voucher.id}
                    onClick={() => setSelectedVoucher(voucher)}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors border"
                  >
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center flex-shrink-0">
                      <Ticket className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-destructive">{getDiscountText(voucher)}</p>
                      <p className="text-xs font-mono text-muted-foreground">{voucher.code}</p>
                      {voucher.min_purchase_amount && voucher.min_purchase_amount > 0 && (
                        <p className="text-xs text-muted-foreground">
                          Đơn tối thiểu {formatPrice(voucher.min_purchase_amount)}
                        </p>
                      )}
                      {voucher.valid_until && (
                        <p className="text-xs text-muted-foreground">
                          HSD: {format(new Date(voucher.valid_until), 'dd/MM/yyyy')}
                        </p>
                      )}
                    </div>
                    <Button variant="outline" size="sm">
                      Chọn
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default SendVoucherSheet;
