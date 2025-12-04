import { Ticket, Copy, Check } from "lucide-react";
import { formatPrice } from "@/utils/priceUtils";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";

interface VoucherShareData {
  voucherId: string;
  code: string;
  discountType: 'fixed' | 'percentage';
  discountValue: number;
  minPurchase?: number;
  maxDiscount?: number;
  validUntil?: string;
  message?: string;
}

interface VoucherShareMessageProps {
  content: string;
  isOwnMessage: boolean;
}

const VoucherShareMessage = ({ content, isOwnMessage }: VoucherShareMessageProps) => {
  const [copied, setCopied] = useState(false);
  
  let data: VoucherShareData;
  
  try {
    data = JSON.parse(content);
  } catch {
    return <p className="text-sm text-muted-foreground">Không thể hiển thị voucher</p>;
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(data.code);
      setCopied(true);
      toast.success('Đã sao chép mã voucher!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Không thể sao chép');
    }
  };

  const discountText = data.discountType === 'percentage' 
    ? `Giảm ${data.discountValue}%`
    : `Giảm ${formatPrice(data.discountValue)}`;

  return (
    <div className={`max-w-[280px] ${isOwnMessage ? 'ml-auto' : ''}`}>
      <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-lg overflow-hidden shadow-md">
        <div className="px-3 py-1.5 flex items-center gap-2 border-b border-white/20">
          <Ticket className="h-3.5 w-3.5 text-white" />
          <span className="text-xs font-medium text-white">
            {isOwnMessage ? 'Bạn đã gửi voucher' : 'Mã giảm giá độc quyền'}
          </span>
        </div>
        
        <div className="p-3 bg-card m-0.5 mb-0 rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center flex-shrink-0">
              <Ticket className="h-7 w-7 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-lg font-bold text-destructive">
                {discountText}
              </p>
              {data.maxDiscount && data.discountType === 'percentage' && (
                <p className="text-xs text-muted-foreground">
                  Tối đa {formatPrice(data.maxDiscount)}
                </p>
              )}
              {data.minPurchase && data.minPurchase > 0 && (
                <p className="text-xs text-muted-foreground">
                  Đơn tối thiểu {formatPrice(data.minPurchase)}
                </p>
              )}
            </div>
          </div>
          
          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 bg-muted rounded px-3 py-2 border-2 border-dashed border-orange-300">
              <span className="font-mono font-bold text-sm tracking-wider">
                {data.code}
              </span>
            </div>
            {!isOwnMessage && (
              <Button 
                onClick={handleCopy}
                variant="outline"
                size="sm"
                className="border-orange-500 text-orange-600 hover:bg-orange-50"
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
          
          {data.validUntil && (
            <p className="mt-2 text-xs text-muted-foreground">
              HSD: {format(new Date(data.validUntil), 'dd/MM/yyyy')}
            </p>
          )}
          
          {data.message && (
            <p className="mt-2 text-xs text-muted-foreground italic">
              "{data.message}"
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoucherShareMessage;
