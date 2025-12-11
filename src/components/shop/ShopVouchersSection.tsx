import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Ticket, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface Voucher {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  min_purchase_amount?: number;
  valid_until?: string;
  usage_limit?: number;
  used_count?: number;
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
        .limit(10);

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
    return `${(voucher.discount_value / 1000).toFixed(0)}k`;
  };

  if (isLoading || vouchers.length === 0) return null;

  return (
    <div className="bg-card">
      <div className="px-4 py-3">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Ticket className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium text-foreground">MÃ GIẢM GIÁ CỦA SHOP</span>
          </div>
          <button className="flex items-center text-xs text-primary">
            Xem tất cả <ChevronRight className="h-3 w-3" />
          </button>
        </div>

        {/* Single Row Horizontal Scroll */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1">
          {vouchers.map((voucher) => (
            <div 
              key={voucher.id}
              className="flex-shrink-0 w-[160px] bg-gradient-to-r from-primary/5 to-transparent border border-primary/20 rounded-lg overflow-hidden flex"
            >
              {/* Left - Discount */}
              <div className="w-[50px] bg-primary/10 flex flex-col items-center justify-center py-2 border-r border-dashed border-primary/30">
                <span className="text-base font-bold text-primary leading-none">
                  {formatDiscount(voucher)}
                </span>
                <span className="text-[8px] text-primary/80 mt-0.5">GIẢM</span>
              </div>
              
              {/* Right - Info */}
              <div className="flex-1 p-1.5 flex flex-col justify-between min-w-0">
                <div className="text-[9px] text-muted-foreground line-clamp-2 leading-tight">
                  {voucher.min_purchase_amount 
                    ? `Đơn tối thiểu ${(voucher.min_purchase_amount / 1000).toFixed(0)}k`
                    : "Không giới hạn"
                  }
                </div>
                
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[8px] px-1 py-0.5 bg-primary/10 text-primary rounded">
                    Mã shop
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-4 px-1.5 text-[9px] text-primary hover:text-primary hover:bg-primary/10"
                    onClick={() => handleSaveVoucher(voucher.code)}
                  >
                    Lưu
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShopVouchersSection;
