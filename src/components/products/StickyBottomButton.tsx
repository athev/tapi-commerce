
import { Button } from "@/components/ui/button";
import { ShoppingCart, Heart, Zap, ShieldCheck, RefreshCw } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface StickyBottomButtonProps {
  onPurchase: () => Promise<any>;
  isProcessing: boolean;
  hasPurchased: boolean;
  productType: string;
  price: number;
  productId?: string;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(price);
};

const StickyBottomButton = ({
  onPurchase,
  isProcessing,
  hasPurchased,
  productType,
  price,
  productId
}: StickyBottomButtonProps) => {
  const isMobile = useIsMobile();

  if (!isMobile || (hasPurchased && productType === 'file_download')) {
    return null;
  }

  const handlePurchase = async () => {
    // The onPurchase function will handle order creation and navigation
    await onPurchase();
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t shadow-2xl z-50 safe-area-pb">
      <div className="p-3 space-y-2">
        {/* Main CTA Row */}
        <div className="flex items-center gap-3">
          {/* Price Section */}
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Tổng thanh toán</p>
            <p className="text-xl font-bold text-destructive">{formatPrice(price)}</p>
          </div>
          
          {/* Buy Now Button */}
          <Button 
            className="flex-[2] bg-destructive hover:bg-destructive/90 h-12 font-bold text-base shadow-lg"
            onClick={handlePurchase}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Đang xử lý...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                MUA NGAY
              </>
            )}
          </Button>
        </div>
        
        {/* Trust Badges Row */}
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-3 w-3 text-green-600" /> 
            Giao tự động
          </span>
          <span className="flex items-center gap-1">
            <RefreshCw className="h-3 w-3 text-blue-600" /> 
            Hoàn tiền 100%
          </span>
          <span className="flex items-center gap-1">
            <Zap className="h-3 w-3 text-orange-600" /> 
            Hỗ trợ 24/7
          </span>
        </div>
        
        {/* Urgency Banner */}
        <div className="bg-gradient-to-r from-orange-100 to-red-100 rounded px-3 py-1.5 text-center">
          <p className="text-xs font-semibold text-orange-800">
            🔥 Ưu đãi đặc biệt - Số lượng có hạn!
          </p>
        </div>
      </div>
    </div>
  );
};

export default StickyBottomButton;
