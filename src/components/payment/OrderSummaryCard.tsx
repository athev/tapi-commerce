import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/utils/orderUtils";
import { ShoppingBag } from "lucide-react";

interface OrderSummaryCardProps {
  productImage?: string;
  productTitle: string;
  productPrice: number;
  discountAmount?: number;
  voucherCode?: string;
  onCheckout?: () => void;
  isProcessing?: boolean;
  showCheckoutButton?: boolean;
}

const OrderSummaryCard = ({ 
  productImage, 
  productTitle, 
  productPrice, 
  discountAmount = 0,
  voucherCode,
  onCheckout,
  isProcessing = false,
  showCheckoutButton = false
}: OrderSummaryCardProps) => {
  const subtotal = productPrice;
  const total = subtotal - discountAmount;

  return (
    <div className="sticky top-4">
      <Card className="border-2">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Đơn hàng (1 sản phẩm)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Product Info */}
          <div className="flex gap-3 pb-4 border-b">
            {productImage && (
              <div className="h-20 w-20 bg-muted rounded overflow-hidden flex-shrink-0">
                <img 
                  src={productImage || '/placeholder.svg'} 
                  alt={productTitle}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm line-clamp-2 mb-1">{productTitle}</h4>
              <p className="text-sm text-muted-foreground">Số lượng: 1</p>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tạm tính:</span>
              <span className="font-medium">{formatPrice(subtotal)}</span>
            </div>
            
            {voucherCode && discountAmount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Giảm giá ({voucherCode}):</span>
                <span className="font-medium">-{formatPrice(discountAmount)}</span>
              </div>
            )}
            
            <Separator />
            
            <div className="flex justify-between items-center">
              <span className="font-bold text-base">Tổng thanh toán:</span>
              <span className="font-bold text-2xl text-destructive">
                {formatPrice(total)}
              </span>
            </div>
          </div>

          {/* Checkout Button */}
          {showCheckoutButton && onCheckout && (
            <Button 
              className="w-full h-12 text-base font-semibold bg-destructive hover:bg-destructive/90"
              onClick={onCheckout}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Đang xử lý...
                </>
              ) : (
                "THANH TOÁN"
              )}
            </Button>
          )}

          {/* Trust Info */}
          <div className="bg-blue-50 rounded-lg p-3 space-y-1">
            <p className="text-xs text-blue-800 flex items-center gap-1">
              ✓ Thanh toán an toàn & bảo mật
            </p>
            <p className="text-xs text-blue-800 flex items-center gap-1">
              ✓ Giao hàng tự động trong 1-2 phút
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderSummaryCard;
