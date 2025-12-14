import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Ticket } from "lucide-react";
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
        <div className="flex items-center gap-2 mb-4">
          <Ticket className="h-5 w-5 text-primary" />
          <h2 className="text-base font-bold text-foreground">Mã Giảm Giá Hôm Nay</h2>
        </div>

        <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1">
          {vouchers.map((voucher) => (
            <div
              key={voucher.id}
              className="flex-shrink-0 w-[240px] md:w-[260px] bg-card border border-border rounded-lg overflow-hidden"
            >
              <div className="flex h-full">
                {/* Left: Discount */}
                <div className="w-[70px] bg-muted/50 flex flex-col items-center justify-center py-4 border-r border-border">
                  <span className="text-xl font-bold text-foreground">
                    {formatDiscount(voucher)}
                  </span>
                  <span className="text-[10px] text-muted-foreground uppercase font-medium">
                    GIẢM
                  </span>
                </div>

                {/* Right: Info */}
                <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold text-foreground line-clamp-1">
                      {voucher.discount_type === 'percentage' 
                        ? `Giảm ${voucher.discount_value}%`
                        : `Giảm ${(voucher.discount_value / 1000).toFixed(0)}K`
                      }
                    </p>
                    {voucher.min_purchase_amount ? (
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        Cho đơn hàng từ {(voucher.min_purchase_amount / 1000).toFixed(0)}K
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        Áp dụng cho mọi đơn hàng
                      </p>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-[11px] text-muted-foreground">
                      {voucher.valid_until 
                        ? `HSD: ${format(new Date(voucher.valid_until), 'dd/MM')}`
                        : 'Không giới hạn'
                      }
                    </p>
                    <button
                      onClick={() => handleSaveVoucher(voucher.code)}
                      className="text-xs font-semibold bg-primary text-primary-foreground rounded px-4 py-1.5 hover:bg-primary/90 transition-colors"
                    >
                      Lưu
                    </button>
                  </div>
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
