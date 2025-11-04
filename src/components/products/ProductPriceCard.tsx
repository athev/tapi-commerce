import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/utils/orderUtils";
import { Download, Users, User, Key, FileText, Heart, ShoppingBag } from "lucide-react";
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
  const getProductTypeInfo = (type: string) => {
    const typeInfo = {
      file_download: {
        icon: Download,
        label: 'File tải về'
      },
      shared_account: {
        icon: Users,
        label: 'Tài khoản dùng chung'
      },
      upgrade_account_no_pass: {
        icon: User,
        label: 'Nâng cấp tài khoản'
      },
      upgrade_account_with_pass: {
        icon: FileText,
        label: 'Nâng cấp tài khoản'
      },
      license_key_delivery: {
        icon: Key,
        label: 'Mã kích hoạt'
      }
    };
    return typeInfo[type as keyof typeof typeInfo] || typeInfo.file_download;
  };
  const productTypeInfo = getProductTypeInfo(product?.product_type || 'file_download');
  const TypeIcon = productTypeInfo.icon;
  return <div className="space-y-2">
      {/* Product Type Badge */}
      <div className="flex items-center gap-1">
        <TypeIcon className="h-4 w-4 text-primary" />
        <Badge variant="secondary" className="text-xs">
          {productTypeInfo.label}
        </Badge>
      </div>

      {/* Price Row with Favorite */}
      <div className="flex items-center justify-between gap-2">
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
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
          <Heart className="h-5 w-5" />
        </Button>
      </div>

      {/* Promotional Tags */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        <Badge className="bg-orange-100 text-orange-700 border border-orange-200 hover:bg-orange-100 text-[11px] px-2 py-0.5 whitespace-nowrap">
          Mã giảm giá
        </Badge>
        <Badge className="bg-red-100 text-red-700 border border-red-200 hover:bg-red-100 text-[11px] px-2 py-0.5 whitespace-nowrap">
          Giảm 50.000đ
        </Badge>
        <Badge className="bg-green-100 text-green-700 border border-green-200 hover:bg-green-100 text-[11px] px-2 py-0.5 whitespace-nowrap">
          Giảm 20%
        </Badge>
      </div>

      {product?.in_stock && product.in_stock > 0 && <p className="text-xs text-muted-foreground">
          Còn lại: <span className="font-semibold text-foreground">{product.in_stock}</span> sản phẩm
        </p>}

      {/* Variants Selector - Only if variants exist */}
      {variants.length > 0 && <Card>
          <CardContent className="p-3">
            <Label className="text-xs font-medium mb-2 block">
              Chọn gói sản phẩm
            </Label>
            
            <RadioGroup value={selectedVariantId || ''} onValueChange={handleVariantChange}>
              <div className="space-y-1.5">
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
          </CardContent>
        </Card>}
    </div>;
};
export default ProductPriceCard;