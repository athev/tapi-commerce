import { Button } from "@/components/ui/button";
import { Zap, ShoppingCart, Shield, Headphones, Lock } from "lucide-react";
import { formatPrice } from "@/utils/orderUtils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ProductCTAButtonsProps {
  currentPrice: number;
  onBuyNow: () => void;
  onServiceRequest?: () => void;
  isProcessing: boolean;
  hasPurchased: boolean;
  productType: string;
  isLoggedIn: boolean;
}

const ProductCTAButtons = ({ 
  currentPrice, 
  onBuyNow,
  onServiceRequest,
  isProcessing,
  hasPurchased,
  productType,
  isLoggedIn
}: ProductCTAButtonsProps) => {
  const isMobile = useIsMobile();

  // Hide on mobile (sticky bottom bar handles it) or after purchase for file_download
  if (isMobile || (hasPurchased && productType === 'file_download')) {
    return null;
  }

  // Service products have different CTA
  if (productType === 'service' && onServiceRequest) {
    return (
      <Button 
        size="lg"
        className="w-full h-14 text-lg font-bold bg-blue-600 hover:bg-blue-700 shadow-lg"
        onClick={onServiceRequest}
        disabled={isProcessing}
      >
        <Headphones className="h-5 w-5 mr-2" />
        YÊU CẦU DỊCH VỤ
      </Button>
    );
  }

  const buttonContent = isProcessing ? (
    <>
      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
      Đang xử lý...
    </>
  ) : !isLoggedIn ? (
    <>
      <Lock className="h-5 w-5 mr-2" />
      ĐĂNG NHẬP ĐỂ MUA
    </>
  ) : (
    <>
      <Zap className="h-5 w-5 mr-2" />
      MUA NGAY
    </>
  );

  return (
    <div className="space-y-4">
      {/* Primary CTA */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              size="lg"
              className="w-full h-14 text-lg font-bold bg-destructive hover:bg-destructive/90 shadow-lg disabled:opacity-70"
              onClick={onBuyNow}
              disabled={isProcessing}
            >
              {buttonContent}
            </Button>
          </TooltipTrigger>
          {!isLoggedIn && (
            <TooltipContent>
              <p>Vui lòng đăng nhập để mua hàng và nhận quà tặng</p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
      
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
