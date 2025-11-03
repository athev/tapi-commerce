import { Button } from "@/components/ui/button";
import { MessageCircle, ShoppingCart, Zap } from "lucide-react";
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
      <div className="flex items-center gap-2 p-2">
        {/* Chat Button */}
        <Button 
          variant="outline" 
          className="h-12 px-3 sm:px-4 flex items-center gap-2 flex-1"
        >
          <MessageCircle className="h-5 w-5" />
          <span className="text-sm font-medium hidden sm:inline">Chat</span>
        </Button>

        {/* Add to Cart Button */}
        <Button 
          variant="outline" 
          className="h-12 px-3 sm:px-4 flex items-center gap-2 flex-1"
        >
          <ShoppingCart className="h-5 w-5" />
          <span className="text-sm font-medium hidden sm:inline">Giỏ</span>
        </Button>

        {/* Buy Now Button - Larger */}
        <Button 
          className="flex-[2] h-12 font-bold bg-destructive hover:bg-destructive/90 text-sm sm:text-base"
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
              <Zap className="h-4 w-4 mr-2" />
              MUA NGAY
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default StickyBottomButton;
