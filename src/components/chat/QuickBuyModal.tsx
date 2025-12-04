import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { formatPrice } from "@/utils/priceUtils";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Minus, Plus, Ticket } from "lucide-react";
import { useVoucherValidation } from "@/hooks/useVoucherValidation";

interface ProductVariant {
  id: string;
  variant_name: string;
  price: number;
  in_stock: number | null;
  image_url?: string | null;
}

interface QuickBuyModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    title: string;
    image?: string;
    price: number;
    seller_id?: string;
  } | null;
}

const QuickBuyModal = ({ isOpen, onClose, product }: QuickBuyModalProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { validateVoucher, calculateDiscount } = useVoucherValidation();
  
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<any>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && product) {
      fetchVariants();
      setQuantity(1);
      setVoucherCode('');
      setAppliedVoucher(null);
      setDiscountAmount(0);
    }
  }, [isOpen, product]);

  const fetchVariants = async () => {
    if (!product) return;
    setLoading(true);
    
    const { data, error } = await supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', product.id)
      .eq('is_active', true)
      .order('sort_order');

    if (!error && data && data.length > 0) {
      setVariants(data);
      setSelectedVariant(data[0]);
    } else {
      setVariants([]);
      setSelectedVariant(null);
    }
    setLoading(false);
  };

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim() || !product) return;
    
    const result = await validateVoucher(voucherCode, product.id, currentPrice);
    if (result.valid && result.voucher) {
      setAppliedVoucher(result.voucher);
      const discount = calculateDiscount(result.voucher, currentPrice);
      setDiscountAmount(discount);
      toast({ title: "Áp dụng voucher thành công!" });
    } else {
      toast({ 
        title: "Voucher không hợp lệ", 
        description: result.error,
        variant: "destructive" 
      });
    }
  };

  const handleSubmit = async () => {
    if (!user || !product) {
      toast({ title: "Vui lòng đăng nhập", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const orderData = {
        user_id: user.id,
        product_id: product.id,
        variant_id: selectedVariant?.id || null,
        status: 'pending',
        bank_amount: finalPrice,
        discount_amount: discountAmount,
        voucher_id: appliedVoucher?.id || null,
        buyer_email: user.email,
        buyer_data: { quantity }
      };

      const { data: order, error } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (error) throw error;

      toast({ title: "Đặt hàng thành công!" });
      onClose();
      navigate(`/payment?orderId=${order.id}`);
    } catch (error: any) {
      toast({ 
        title: "Lỗi đặt hàng", 
        description: error.message,
        variant: "destructive" 
      });
    } finally {
      setSubmitting(false);
    }
  };

  const currentPrice = selectedVariant?.price || product?.price || 0;
  const totalPrice = currentPrice * quantity;
  const finalPrice = Math.max(0, totalPrice - discountAmount);

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Mua nhanh</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Product Info */}
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <img
                src={selectedVariant?.image_url || product.image || '/placeholder.svg'}
                alt={product.title}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium line-clamp-2">{product.title}</p>
                <p className="text-destructive font-bold">
                  {formatPrice(currentPrice)}
                </p>
              </div>
            </div>

            {/* Variants */}
            {variants.length > 0 && (
              <div>
                <Label className="text-sm font-medium">Phân loại</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant)}
                      disabled={variant.in_stock !== null && variant.in_stock <= 0}
                      className={`px-3 py-2 border rounded-lg text-sm transition-colors ${
                        selectedVariant?.id === variant.id
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:border-primary/50'
                      } ${variant.in_stock !== null && variant.in_stock <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {variant.variant_name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <Label className="text-sm font-medium">Số lượng</Label>
              <div className="flex items-center gap-3 mt-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Voucher */}
            <div>
              <Label className="text-sm font-medium">Mã giảm giá</Label>
              <div className="flex gap-2 mt-2">
                <div className="relative flex-1">
                  <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Nhập mã voucher"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline" onClick={handleApplyVoucher}>
                  Áp dụng
                </Button>
              </div>
              {appliedVoucher && (
                <p className="text-sm text-green-600 mt-1">
                  Đã áp dụng: Giảm {formatPrice(discountAmount)}
                </p>
              )}
            </div>

            {/* Summary */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tạm tính</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Giảm giá</span>
                  <span className="text-green-600">-{formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold">
                <span>Tổng cộng</span>
                <span className="text-destructive">{formatPrice(finalPrice)}</span>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              className="w-full"
              size="lg"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Xác nhận đặt hàng
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default QuickBuyModal;
