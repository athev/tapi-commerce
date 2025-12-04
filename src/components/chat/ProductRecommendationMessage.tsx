import { ShoppingCart } from "lucide-react";
import { formatPrice } from "@/utils/priceUtils";
import { Button } from "@/components/ui/button";

interface ProductRecommendationData {
  productId: string;
  title: string;
  image?: string;
  price: number;
  originalPrice?: number;
  message?: string;
}

interface ProductRecommendationMessageProps {
  content: string;
  isOwnMessage: boolean;
  onBuyNow?: (productId: string) => void;
}

const ProductRecommendationMessage = ({ 
  content, 
  isOwnMessage,
  onBuyNow 
}: ProductRecommendationMessageProps) => {
  let data: ProductRecommendationData;
  
  try {
    data = JSON.parse(content);
  } catch {
    return <p className="text-sm text-muted-foreground">Không thể hiển thị sản phẩm</p>;
  }

  return (
    <div className={`max-w-[280px] ${isOwnMessage ? 'ml-auto' : ''}`}>
      <div className="bg-card border-2 border-primary/20 rounded-lg overflow-hidden shadow-sm">
        <div className="bg-primary/10 px-3 py-1.5 flex items-center gap-2">
          <ShoppingCart className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-medium text-primary">
            {isOwnMessage ? 'Bạn đã gửi sản phẩm' : 'Người bán gợi ý sản phẩm'}
          </span>
        </div>
        
        <div className="p-3">
          <div className="flex gap-3">
            <img 
              src={data.image || '/placeholder.svg'} 
              alt={data.title}
              className="w-20 h-20 rounded-lg object-cover border"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium line-clamp-2 text-foreground">
                {data.title}
              </p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-destructive font-bold">
                  {formatPrice(data.price)}
                </span>
                {data.originalPrice && data.originalPrice > data.price && (
                  <span className="text-xs text-muted-foreground line-through">
                    {formatPrice(data.originalPrice)}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {data.message && (
            <p className="mt-2 text-xs text-muted-foreground italic">
              "{data.message}"
            </p>
          )}
          
          {!isOwnMessage && onBuyNow && (
            <Button 
              onClick={() => onBuyNow(data.productId)}
              className="w-full mt-3 bg-destructive hover:bg-destructive/90"
              size="sm"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Mua ngay
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductRecommendationMessage;
