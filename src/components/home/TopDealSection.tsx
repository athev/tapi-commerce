import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChevronRight, Zap } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Link } from "react-router-dom";
import CountdownTimer from "./CountdownTimer";

const TopDealSection = () => {
  const { data: products, isLoading } = useQuery({
    queryKey: ['top-deal-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_variants(id, variant_name, price, original_price, discount_percentage)
        `)
        .eq('status', 'active')
        .order('purchases', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    }
  });

  if (isLoading || !products || products.length === 0) {
    return null;
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(price);
  };

  // Deal ends in 3 hours
  const dealEndTime = new Date(Date.now() + 3 * 60 * 60 * 1000);

  return (
    <section className="bg-card py-4 border-y border-border">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1.5 rounded-lg">
              <Zap className="h-4 w-4 fill-current" />
              <span className="text-sm font-bold">TOP DEAL</span>
            </div>
            <CountdownTimer endTime={dealEndTime} />
          </div>
          <Link 
            to="/?category=Top+Deal" 
            className="text-xs text-primary hover:text-primary/80 flex items-center gap-0.5 font-medium"
          >
            Xem tất cả
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Products */}
        <ScrollArea className="w-full">
          <div className="flex gap-3 pb-2">
            {products.map((product) => {
              const hasVariants = product.product_variants && product.product_variants.length > 0;
              const firstVariant = hasVariants ? product.product_variants[0] : null;
              const displayPrice = firstVariant?.price || product.price;
              const originalPrice = firstVariant?.original_price || displayPrice * 1.3;
              const discount = firstVariant?.discount_percentage || Math.round((originalPrice - displayPrice) / originalPrice * 100);

              return (
                <Link
                  key={product.id}
                  to={`/product/${product.slug || product.id}`}
                  className="flex-shrink-0 w-[140px] md:w-[160px] bg-background rounded-lg overflow-hidden border border-border hover:border-primary/50 hover:shadow-md transition-all group"
                >
                  {/* Image */}
                  <div className="relative aspect-square bg-muted">
                    <img
                      src={product.image || '/placeholder.svg'}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    {/* Discount Badge */}
                    {discount > 0 && (
                      <div className="absolute top-0 right-0 bg-destructive text-destructive-foreground text-[10px] font-bold px-1.5 py-0.5">
                        -{discount}%
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-2.5">
                    <h3 className="text-xs font-medium text-foreground line-clamp-2 mb-2 min-h-[2rem] leading-tight">
                      {product.title}
                    </h3>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-destructive font-bold text-sm">
                        {formatPrice(displayPrice)}
                      </span>
                      {originalPrice > displayPrice && (
                        <span className="text-[10px] text-muted-foreground line-through">
                          {formatPrice(originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </section>
  );
};

export default TopDealSection;
