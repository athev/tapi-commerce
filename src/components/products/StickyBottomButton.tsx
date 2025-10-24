import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import { formatPrice } from "@/utils/orderUtils";
import { useIsMobile } from "@/hooks/use-mobile";

interface StickyBottomButtonProps {
  onBuyNow: () => void;
  isProcessing: boolean;
  hasPurchased: boolean;
  productType: string;
  price: number;
}

const StickyBottomButton = ({ 
  onBuyNow, 
  isProcessing, 
  hasPurchased,
  productType,
  price
}: StickyBottomButtonProps) => {
  const isMobile = useIsMobile();

  if (!isMobile || (hasPurchased && productType === 'file_download')) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t shadow-2xl z-50 safe-area-pb">
      <div className="flex items-center gap-3 p-3">
        <div className="flex-1">
          <p className="text-xs text-muted-foreground">Giá sản phẩm</p>
          <p className="text-xl font-bold text-destructive">
            {formatPrice(price)}
          </p>
        </div>
        <Button 
          size="lg" 
          className="flex-[2] h-12 font-bold bg-destructive hover:bg-destructive/90"
          onClick={onBuyNow}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Xử lý...
            </>
          ) : (
            <>
              <Zap className="mr-2 h-4 w-4" />
              MUA NGAY
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default StickyBottomButton;
