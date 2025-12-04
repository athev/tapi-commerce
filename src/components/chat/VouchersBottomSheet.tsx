import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/utils/priceUtils";
import { Loader2, Ticket, Check } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

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

interface VouchersBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  sellerId: string;
  shopName?: string;
  onSelectVoucher: (voucher: Voucher) => void;
  selectedVoucherId?: string;
}

const VouchersBottomSheet = ({
  isOpen,
  onClose,
  sellerId,
  shopName,
  onSelectVoucher,
  selectedVoucherId,
}: VouchersBottomSheetProps) => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && sellerId) {
      fetchVouchers();
    }
  }, [isOpen, sellerId]);

  const fetchVouchers = async () => {
    setLoading(true);
    const now = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('vouchers')
      .select('*')
      .eq('created_by', sellerId)
      .eq('is_active', true)
      .or(`valid_until.is.null,valid_until.gte.${now}`)
      .order('discount_value', { ascending: false });

    if (!error && data) {
      // Filter vouchers that haven't reached usage limit
      const validVouchers = data.filter(v => 
        !v.usage_limit || (v.used_count || 0) < v.usage_limit
      );
      setVouchers(validVouchers);
    }
    setLoading(false);
  };

  const formatDiscount = (voucher: Voucher) => {
    if (voucher.discount_type === 'percentage') {
      return `Giảm ${voucher.discount_value}%`;
    }
    return `Giảm ${formatPrice(voucher.discount_value)}`;
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[60vh] rounded-t-xl">
        <SheetHeader className="pb-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5 text-primary" />
            Voucher của {shopName || 'Shop'}
          </SheetTitle>
        </SheetHeader>
        
        <ScrollArea className="h-[calc(60vh-80px)] mt-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : vouchers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Không có voucher khả dụng
            </div>
          ) : (
            <div className="space-y-3 pr-4">
              {vouchers.map((voucher) => (
                <div 
                  key={voucher.id}
                  className={`relative border rounded-lg overflow-hidden transition-colors ${
                    selectedVoucherId === voucher.id 
                      ? 'border-primary bg-primary/5' 
                      : 'hover:bg-muted/50'
                  }`}
                >
                  <div className="flex">
                    {/* Left colored section */}
                    <div className="w-20 bg-destructive/10 flex flex-col items-center justify-center p-3 border-r border-dashed">
                      <Ticket className="h-6 w-6 text-destructive mb-1" />
                      <span className="text-xs text-destructive font-bold text-center">
                        {voucher.discount_type === 'percentage' 
                          ? `${voucher.discount_value}%` 
                          : formatPrice(voucher.discount_value)}
                      </span>
                    </div>
                    
                    {/* Right content */}
                    <div className="flex-1 p-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-sm">{formatDiscount(voucher)}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Mã: <span className="font-mono font-medium">{voucher.code}</span>
                          </p>
                          {voucher.min_purchase_amount && (
                            <p className="text-xs text-muted-foreground">
                              Đơn tối thiểu {formatPrice(voucher.min_purchase_amount)}
                            </p>
                          )}
                          {voucher.max_discount_amount && voucher.discount_type === 'percentage' && (
                            <p className="text-xs text-muted-foreground">
                              Giảm tối đa {formatPrice(voucher.max_discount_amount)}
                            </p>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant={selectedVoucherId === voucher.id ? "default" : "outline"}
                          onClick={() => onSelectVoucher(voucher)}
                          className="shrink-0"
                        >
                          {selectedVoucherId === voucher.id ? (
                            <>
                              <Check className="h-4 w-4 mr-1" />
                              Đã chọn
                            </>
                          ) : (
                            'Áp dụng'
                          )}
                        </Button>
                      </div>
                      
                      {voucher.valid_until && (
                        <Badge variant="secondary" className="mt-2 text-xs">
                          HSD: {format(new Date(voucher.valid_until), 'dd/MM/yyyy', { locale: vi })}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {/* Selected indicator */}
                  {selectedVoucherId === voucher.id && (
                    <div className="absolute top-0 right-0 w-0 h-0 border-t-[20px] border-t-primary border-l-[20px] border-l-transparent" />
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default VouchersBottomSheet;
