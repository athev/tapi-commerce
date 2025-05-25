
import { Button } from "@/components/ui/button";
import { ShoppingCart, Heart, MessageCircle } from "lucide-react";
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
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40 backdrop-blur-sm">
      <div className="container py-3 pb-6">
        <div className="flex items-center space-x-3">
          {/* Quick Actions */}
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-12 w-12 p-0 border-gray-300 bg-white hover:bg-gray-50"
            >
              <Heart className="h-5 w-5 text-gray-600" />
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="h-12 w-12 p-0 border-gray-300 bg-white hover:bg-gray-50"
            >
              <MessageCircle className="h-5 w-5 text-gray-600" />
            </Button>
          </div>
          
          {/* Main Purchase Button */}
          <Button 
            className="flex-1 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white h-12 font-bold text-base shadow-lg"
            onClick={onPurchase}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                <span>Đang xử lý...</span>
              </div>
            ) : (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center">
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  <span>Mua ngay</span>
                </div>
                <span className="font-bold">
                  {formatPrice(price)}
                </span>
              </div>
            )}
          </Button>
        </div>
        
        {/* Trust Signal */}
        <div className="flex items-center justify-center mt-2 text-xs text-gray-500">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>
          <span>Bảo mật thanh toán • Hoàn tiền 100%</span>
        </div>
      </div>
    </div>
  );
};

export default StickyBottomButton;
