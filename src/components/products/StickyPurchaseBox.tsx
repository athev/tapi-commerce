import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Zap, Headphones, ShoppingCart } from "lucide-react";
import { formatPrice } from "@/utils/priceUtils";
import QuantitySelector from "./QuantitySelector";
import { useState } from "react";

interface StickyPurchaseBoxProps {
  currentPrice: number;
  originalPrice?: number;
  discountPercentage?: number;
  variants?: Array<{ id: string; name: string; price: number }>;
  onBuyNow: () => void;
  onAddToCart?: () => void;
  isProcessing: boolean;
  isLoggedIn: boolean;
}

const StickyPurchaseBox = ({
  currentPrice,
  originalPrice,
  discountPercentage,
  variants = [],
  onBuyNow,
  onAddToCart,
  isProcessing,
  isLoggedIn
}: StickyPurchaseBoxProps) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(variants[0]?.id || "");

  return (
    <div className="sticky top-24">
      <Card>
        <CardContent className="p-4 space-y-4">
          {/* Price summary */}
          <div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-3xl font-bold text-destructive">
                {formatPrice(currentPrice)}
              </span>
              {discountPercentage && (
                <Badge variant="destructive" className="text-xs">
                  -{discountPercentage}%
                </Badge>
              )}
            </div>
            {originalPrice && originalPrice > currentPrice && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(originalPrice)}
              </span>
            )}
          </div>
          
          {/* Variant selector */}
          {variants.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-2 block">Chọn gói:</label>
              <Select value={selectedVariant} onValueChange={setSelectedVariant}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn gói sản phẩm" />
                </SelectTrigger>
                <SelectContent>
                  {variants.map(variant => (
                    <SelectItem key={variant.id} value={variant.id}>
                      {variant.name} - {formatPrice(variant.price)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          {/* Quantity */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Số lượng:</span>
            <QuantitySelector value={quantity} onChange={setQuantity} />
          </div>
          
          {/* CTA Buttons */}
          <div className="space-y-2">
            <Button 
              className="w-full h-12 text-base font-bold" 
              size="lg"
              onClick={onBuyNow}
              disabled={isProcessing || !isLoggedIn}
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <Zap className="h-5 w-5 mr-2" />
                  MUA NGAY
                </>
              )}
            </Button>
            {onAddToCart && (
              <Button 
                variant="outline" 
                className="w-full h-11" 
                size="lg"
                onClick={onAddToCart}
                disabled={isProcessing || !isLoggedIn}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Thêm vào giỏ hàng
              </Button>
            )}
          </div>
          
          {/* Trust badges */}
          <div className="space-y-2 text-sm text-muted-foreground border-t pt-3">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-600" />
              <span>Bảo mật 100%</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-blue-600" />
              <span>Giao hàng ngay lập tức</span>
            </div>
            <div className="flex items-center gap-2">
              <Headphones className="h-4 w-4 text-purple-600" />
              <span>Hỗ trợ 24/7</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StickyPurchaseBox;
