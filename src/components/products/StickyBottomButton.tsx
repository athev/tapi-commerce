import { Button } from "@/components/ui/button";
import { MessageCircle, ShoppingCart, Zap, Lock } from "lucide-react";
import { formatPrice } from "@/utils/orderUtils";
import { useIsMobile } from "@/hooks/use-mobile";

interface StickyBottomButtonProps {
  onBuyNow: () => void;
  isProcessing: boolean;
  hasPurchased: boolean;
  productType: string;
  price: number;
  isLoggedIn: boolean;
}

const StickyBottomButton = ({ 
  onBuyNow, 
  isProcessing, 
  hasPurchased,
  productType,
  price,
  isLoggedIn
}: StickyBottomButtonProps) => {
  const isMobile = useIsMobile();

  if (!isMobile || (hasPurchased && productType === 'file_download')) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t shadow-2xl z-50 pb-safe">
      <div className="flex items-stretch h-16 gap-2 p-2">
        {/* Chat icon - smaller */}
        <Button 
          variant="outline" 
          size="icon"
          className="h-full px-3"
        >
          <MessageCircle className="h-5 w-5" />
        </Button>

        {/* Cart icon - smaller */}
        <Button 
          variant="outline" 
          size="icon"
          className="h-full px-3"
        >
          <ShoppingCart className="h-5 w-5" />
        </Button>

        {/* Buy Now Button - Takes 60% width */}
        <Button 
          className="flex-[3] h-full font-bold bg-destructive hover:bg-destructive/90 text-base disabled:opacity-70"
          onClick={onBuyNow}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Xử lý...
            </>
          ) : !isLoggedIn ? (
            <>
              <Lock className="h-5 w-5 mr-2" />
              ĐĂNG NHẬP
            </>
          ) : (
            <>
              <Zap className="h-5 w-5 mr-1" />
              MUA NGAY • {formatPrice(price)}
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default StickyBottomButton;
