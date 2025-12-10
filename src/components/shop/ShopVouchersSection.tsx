import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Ticket, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Voucher {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  min_purchase_amount?: number;
}

interface ShopVouchersSectionProps {
  sellerId: string;
}

const ShopVouchersSection = ({ sellerId }: ShopVouchersSectionProps) => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVouchers = async () => {
      const { data, error } = await supabase
        .from('vouchers')
        .select('*')
        .eq('created_by', sellerId)
        .eq('is_active', true)
        .limit(5);

      if (!error && data) {
        setVouchers(data);
      }
      setIsLoading(false);
    };

    fetchVouchers();
  }, [sellerId]);

  const handleSaveVoucher = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Đã sao chép mã: ${code}`);
  };

  const formatDiscount = (voucher: Voucher) => {
    if (voucher.discount_type === 'percentage') {
      return `${voucher.discount_value}%`;
    }
    return `${(voucher.discount_value / 1000).toFixed(0)}K`;
  };

  if (isLoading || vouchers.length === 0) return null;

  return (
    <div className="bg-card border-b">
      <div className="px-4 py-3">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Ticket className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">MÃ GIẢM GIÁ</span>
          </div>
          <button className="flex items-center text-xs text-primary">
            Xem <ChevronRight className="h-3 w-3" />
          </button>
        </div>

        {/* Vouchers Carousel */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1">
          {vouchers.map((voucher) => (
            <div 
              key={voucher.id}
              className="flex-shrink-0 w-28 bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-2.5 text-center"
            >
              <div className="text-lg font-bold text-primary">
                {formatDiscount(voucher)}
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5 mb-2">
                {voucher.min_purchase_amount 
                  ? `Đơn từ ${(voucher.min_purchase_amount / 1000).toFixed(0)}K`
                  : "Không giới hạn"
                }
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full h-7 text-xs"
                onClick={() => handleSaveVoucher(voucher.code)}
              >
                Lưu
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShopVouchersSection;
