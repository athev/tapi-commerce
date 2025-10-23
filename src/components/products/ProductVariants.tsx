import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { formatPrice } from "@/utils/orderUtils";

export interface ProductVariant {
  id: string;
  variant_name: string;
  price: number;
  original_price?: number;
  discount_percentage?: number;
  badge?: string;
  is_active: boolean;
}

interface ProductVariantsProps {
  variants: ProductVariant[];
  selectedVariantId: string | null;
  onVariantSelect: (variantId: string) => void;
  basePrice: number;
}

const ProductVariants = ({ 
  variants, 
  selectedVariantId, 
  onVariantSelect,
  basePrice 
}: ProductVariantsProps) => {
  // If no variants, show single price option
  if (!variants || variants.length === 0) {
    return (
      <div className="space-y-3">
        <Button 
          variant="default"
          className="w-full justify-between h-auto p-4 bg-primary hover:bg-primary/90"
        >
          <div className="text-left flex-1">
            <div className="font-semibold text-base">Gói sản phẩm</div>
            <div className="text-sm opacity-90">{formatPrice(basePrice)}</div>
          </div>
          <Check className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-sm text-muted-foreground">Chọn gói sản phẩm</h3>
      <div className="grid grid-cols-1 gap-3">
        {variants.filter(v => v.is_active).map((variant) => {
          const isSelected = selectedVariantId === variant.id;
          
          return (
            <Button 
              key={variant.id}
              variant={isSelected ? "default" : "outline"}
              className={`w-full justify-between h-auto p-4 transition-all ${
                isSelected 
                  ? "bg-primary hover:bg-primary/90 border-primary" 
                  : "hover:border-primary/50"
              }`}
              onClick={() => onVariantSelect(variant.id)}
            >
              <div className="text-left flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`font-semibold text-base ${isSelected ? "text-primary-foreground" : ""}`}>
                    {variant.variant_name}
                  </span>
                  {variant.badge && (
                    <Badge 
                      variant="secondary" 
                      className="text-xs bg-accent text-accent-foreground"
                    >
                      {variant.badge}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`font-bold text-base ${isSelected ? "text-primary-foreground" : "text-primary"}`}>
                    {formatPrice(variant.price)}
                  </span>
                  {variant.original_price && variant.original_price > variant.price && (
                    <>
                      <span className={`text-xs line-through ${isSelected ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                        {formatPrice(variant.original_price)}
                      </span>
                      {variant.discount_percentage && (
                        <Badge variant="destructive" className="text-xs px-1.5 py-0">
                          -{variant.discount_percentage}%
                        </Badge>
                      )}
                    </>
                  )}
                </div>
              </div>
              {isSelected && <Check className="h-5 w-5" />}
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default ProductVariants;
