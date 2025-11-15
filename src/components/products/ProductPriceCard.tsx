import { useState, useEffect } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/utils/orderUtils";
import { Heart } from "lucide-react";
interface ProductVariant {
  id: string;
  variant_name: string;
  price: number;
  original_price?: number | null;
  discount_percentage?: number | null;
  badge?: string | null;
}
interface ProductPriceCardProps {
  product: any;
  onPriceChange: (price: number, variantId: string | null, variantName?: string) => void;
}
const ProductPriceCard = ({
  product,
  onPriceChange
}: ProductPriceCardProps) => {
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [currentPrice, setCurrentPrice] = useState(product?.price || 0);
  const [originalPrice, setOriginalPrice] = useState<number | null>(null);
  const [discountPercentage, setDiscountPercentage] = useState<number | null>(null);

  // Fetch variants
  useEffect(() => {
    const fetchVariants = async () => {
      if (!product?.id) return;
      const {
        data,
        error
      } = await supabase.from('product_variants').select('*').eq('product_id', product.id).eq('is_active', true).order('sort_order', {
        ascending: true
      });
      if (!error && data && data.length > 0) {
        setVariants(data);
        // Auto-select first variant
        const firstVariant = data[0];
        setSelectedVariantId(firstVariant.id);
        setCurrentPrice(firstVariant.price);
        setOriginalPrice(firstVariant.original_price || null);
        setDiscountPercentage(firstVariant.discount_percentage || null);
        onPriceChange(firstVariant.price, firstVariant.id, firstVariant.variant_name);
      } else {
        // No variants, use base price
        setCurrentPrice(product.price);
        onPriceChange(product.price, null);
      }
    };
    fetchVariants();
  }, [product?.id]);
  const handleVariantChange = (variantId: string) => {
    setSelectedVariantId(variantId);
    const variant = variants.find(v => v.id === variantId);
    if (variant) {
      setCurrentPrice(variant.price);
      setOriginalPrice(variant.original_price || null);
      setDiscountPercentage(variant.discount_percentage || null);
      onPriceChange(variant.price, variantId, variant.variant_name);
    }
  };
  return <div className="space-y-2">
      {/* Price Row */}
      <div className="flex items-baseline gap-2 flex-wrap mx-0 px-0">
        <span className="text-2xl sm:text-3xl font-extrabold text-destructive">
          {formatPrice(currentPrice)}
        </span>
        {originalPrice && originalPrice > currentPrice && <>
            <span className="text-base text-muted-foreground line-through">
              {formatPrice(originalPrice)}
            </span>
            {discountPercentage && <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                -{discountPercentage}%
              </Badge>}
          </>}
      </div>

      {product?.in_stock && product.in_stock > 0 && <p className="text-xs text-muted-foreground">
          Còn lại: <span className="font-semibold text-foreground">{product.in_stock}</span> sản phẩm
        </p>}

      {/* Variants Selector - Only if variants exist */}
      {variants.length > 0 && <div className="bg-muted/30 rounded-lg p-2 space-y-1.5">
          <Label className="text-xs font-medium block">
            Chọn gói sản phẩm
          </Label>
          
          <RadioGroup value={selectedVariantId || ''} onValueChange={handleVariantChange}>
            <div className="space-y-1">
              {variants.map(variant => <label key={variant.id} className="flex items-center justify-between p-2 border rounded-lg cursor-pointer hover:border-primary transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value={variant.id} />
                    <div>
                      <p className="font-medium text-sm">{variant.variant_name}</p>
                      {variant.badge && <Badge variant="secondary" className="text-[10px] mt-0.5">
                          {variant.badge}
                        </Badge>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-bold text-destructive">
                      {formatPrice(variant.price)}
                    </p>
                    {variant.original_price && variant.original_price > variant.price && <p className="text-[10px] line-through text-muted-foreground">
                        {formatPrice(variant.original_price)}
                      </p>}
                  </div>
                </label>)}
            </div>
          </RadioGroup>
        </div>}
    </div>;
};
export default ProductPriceCard;