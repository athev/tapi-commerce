import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChevronRight } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Link } from "react-router-dom";
import CountdownTimer from "./CountdownTimer";

const FlashSaleSection = () => {
  // Query flash sale products (products with high discount or recent)
  const { data: flashSaleProducts, isLoading } = useQuery({
    queryKey: ['flash-sale-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_variants(id, variant_name, price, original_price, discount_percentage)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data || [];
    },
  });

  if (isLoading || !flashSaleProducts || flashSaleProducts.length === 0) {
    return null;
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND',
      maximumFractionDigits: 0 
    }).format(price);
  };

  // Flash sale ends in 3 hours from now
  const flashSaleEndTime = new Date(Date.now() + 3 * 60 * 60 * 1000);

  return (
    <div className="bg-gradient-to-r from-destructive to-destructive/90 py-6">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚡</span>
              <h2 className="text-xl md:text-2xl font-bold text-destructive-foreground">
                FLASH SALE
              </h2>
            </div>
            <CountdownTimer endTime={flashSaleEndTime} />
          </div>
          <Link 
            to="/?category=Flash Sale"
            className="text-sm text-destructive-foreground hover:text-destructive-foreground/80 flex items-center gap-1"
          >
            Xem tất cả
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <ScrollArea className="w-full">
          <div className="flex gap-3 pb-4">
            {flashSaleProducts.map((product) => {
              const hasVariants = product.product_variants && product.product_variants.length > 0;
              const firstVariant = hasVariants ? product.product_variants[0] : null;
              const displayPrice = firstVariant?.price || product.price;
              const originalPrice = firstVariant?.original_price;
              const discount = firstVariant?.discount_percentage || 20;

              return (
                <Link
                  key={product.id}
                  to={`/product/${product.id}`}
                  className="flex-shrink-0 w-40 md:w-48 bg-card rounded-lg overflow-hidden hover:shadow-lg transition-all group"
                >
                  <div className="relative aspect-square bg-muted">
                    <img
                      src={product.image || '/placeholder.svg'}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute top-2 right-2 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded">
                      -{discount}%
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-medium text-foreground line-clamp-2 mb-2 h-10">
                      {product.title}
                    </h3>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-destructive font-bold text-lg">
                          {formatPrice(displayPrice)}
                        </span>
                      </div>
                      {originalPrice && (
                        <div className="text-xs text-muted-foreground line-through">
                          {formatPrice(originalPrice)}
                        </div>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1 bg-white/30 rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-yellow-400 h-full rounded-full transition-all"
                            style={{ width: '45%' }}
                          />
                        </div>
                        <span className="text-[10px] text-white font-medium bg-black/20 px-1.5 py-0.5 rounded">Đã bán 45</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  );
};

export default FlashSaleSection;
