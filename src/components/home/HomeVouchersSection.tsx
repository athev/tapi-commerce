import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Ticket, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface Voucher {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  min_purchase_amount: number | null;
  max_discount_amount: number | null;
  valid_until: string | null;
}

const HomeVouchersSection = () => {
  const { data: vouchers, isLoading } = useQuery({
    queryKey: ['home-vouchers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vouchers')
        .select('*')
        .eq('is_active', true)
        .or('valid_until.is.null,valid_until.gte.' + new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(8);

      if (error) throw error;
      return data as Voucher[];
    }
  });

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

  if (isLoading || !vouchers || vouchers.length === 0) {
    return null;
  }

  return (
    <section className="bg-card py-4">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Ticket className="h-5 w-5 text-primary" />
            <h2 className="text-base font-bold text-foreground">Mã Giảm Giá Hôm Nay</h2>
          </div>
          <button className="text-xs text-primary hover:text-primary/80 flex items-center gap-0.5 font-medium">
            Xem tất cả
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1">
          {vouchers.map((voucher) => (
            <div
              key={voucher.id}
              className="flex-shrink-0 w-[160px] md:w-[180px] bg-card border border-border rounded-lg overflow-hidden"
            >
              <div className="flex h-full">
                {/* Left: Discount */}
                <div className="w-[60px] md:w-[65px] bg-muted flex flex-col items-center justify-center py-3 border-r border-border">
                  <span className="text-lg md:text-xl font-bold text-foreground">
                    {formatDiscount(voucher)}
                  </span>
                  <span className="text-[9px] text-muted-foreground uppercase font-medium">
                    GIẢM
                  </span>
                </div>

                {/* Right: Info */}
                <div className="flex-1 p-2 flex flex-col justify-between min-w-0">
                  <div>
                    <p className="text-[11px] font-medium text-foreground line-clamp-1">
                      {voucher.discount_type === 'percentage' 
                        ? `Giảm ${voucher.discount_value}%`
                        : `Giảm ${(voucher.discount_value / 1000).toFixed(0)}K`
                      }
                    </p>
                    {voucher.min_purchase_amount && (
                      <p className="text-[10px] text-muted-foreground">
                        Đơn từ {(voucher.min_purchase_amount / 1000).toFixed(0)}K
                      </p>
                    )}
                    {voucher.valid_until && (
                      <p className="text-[9px] text-muted-foreground mt-0.5">
                        HSD: {format(new Date(voucher.valid_until), 'dd/MM')}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleSaveVoucher(voucher.code)}
                    className="mt-1.5 w-full text-[10px] font-semibold bg-primary text-primary-foreground rounded px-2 py-1 hover:bg-primary/90 transition-colors"
                  >
                    Lưu
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomeVouchersSection;
