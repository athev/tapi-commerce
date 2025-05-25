
import { Button } from "@/components/ui/button";
import { ShoppingCart, Heart, Zap } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface StickyBottomButtonProps {
  onPurchase: () => void;
  isProcessing: boolean;
  hasPurchased: boolean;
  productType: string;
  price: number;
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
  price
}: StickyBottomButtonProps) => {
  const isMobile = useIsMobile();

  if (!isMobile || (hasPurchased && productType === 'file_download')) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 safe-area-pb z-50 shadow-lg">
      <div className="flex items-center space-x-3">
        <Button 
          variant="outline" 
          size="sm" 
          className="h-12 w-12 p-0 border-gray-300"
        >
          <Heart className="h-5 w-5" />
        </Button>
        
        <div className="flex-1 flex items-center space-x-3">
          <Button 
            className="flex-1 bg-red-500 hover:bg-red-600 text-white h-12 font-semibold text-base"
            onClick={onPurchase}
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
                Mua ngay - {formatPrice(price)}
              </>
            )}
          </Button>
        </div>
      </div>
      
      {/* Urgency Message */}
      <div className="mt-2 text-center">
        <p className="text-xs text-red-600 font-medium">
          🔥 Giảm 30% - Chỉ còn hôm nay!
        </p>
      </div>
    </div>
  );
};

export default StickyBottomButton;
