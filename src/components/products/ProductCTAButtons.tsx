import { Button } from "@/components/ui/button";
import { Zap, ShoppingCart, Shield, Headphones } from "lucide-react";
import { formatPrice } from "@/utils/orderUtils";

interface ProductCTAButtonsProps {
  currentPrice: number;
  onBuyNow: () => void;
  isProcessing: boolean;
  hasPurchased: boolean;
  productType: string;
}

const ProductCTAButtons = ({ 
  currentPrice, 
  onBuyNow, 
  isProcessing,
  hasPurchased,
  productType
}: ProductCTAButtonsProps) => {
  // Don't show CTA for file_download after purchase
  if (hasPurchased && productType === 'file_download') {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Primary CTA */}
      <Button 
        size="lg"
        className="w-full h-14 text-lg font-bold bg-destructive hover:bg-destructive/90 shadow-lg"
        onClick={onBuyNow}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Đang xử lý...
          </>
        ) : (
          <>
            <Zap className="h-5 w-5 mr-2" />
            MUA NGAY
          </>
        )}
      </Button>
      
      {/* Minimal Trust Indicators */}
      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground pt-2">
        <span className="flex items-center gap-1">
          <Shield className="h-3 w-3" /> Bảo mật 100%
        </span>
        <span className="flex items-center gap-1">
          <Zap className="h-3 w-3" /> Giao ngay
        </span>
        <span className="flex items-center gap-1">
          <Headphones className="h-3 w-3" /> Hỗ trợ 24/7
        </span>
      </div>
    </div>
  );
};

export default ProductCTAButtons;
