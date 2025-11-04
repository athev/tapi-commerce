import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChevronRight } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Link } from "react-router-dom";
import CountdownTimer from "./CountdownTimer";
const FlashSaleSection = () => {
  // Query flash sale products (products with high discount or recent)
  const {
    data: flashSaleProducts,
    isLoading
  } = useQuery({
    queryKey: ['flash-sale-products'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('products').select(`
          *,
          product_variants(id, variant_name, price, original_price, discount_percentage)
        `).eq('status', 'active').order('created_at', {
        ascending: false
      }).limit(10);
      if (error) throw error;
      return data || [];
    }
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
  return <div style={{
    background: 'linear-gradient(90deg, #ff6b35 0%, #f7931e 100%)'
  }} className="py-4">
      <div className="container mx-auto px-[9px]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg md:text-xl font-extrabold uppercase tracking-wide text-emerald-400">
              FLASH SALE
            </h2>
            <CountdownTimer endTime={flashSaleEndTime} />
          </div>
          <Link to="/?category=Flash Sale" className="text-xs md:text-sm text-black hover:text-red/90 flex items-center gap-0.5 font-medium mx-0 px-0">
            Xem Tất Cả
            <ChevronRight className="h-3.5 w-3.5 md:h-4 md:w-4" />
          </Link>
        </div>

        <ScrollArea className="w-full">
          <div className="flex gap-2 sm:gap-2.5 pb-4 pl-1">
            {flashSaleProducts.map(product => {
            const hasVariants = product.product_variants && product.product_variants.length > 0;
            const firstVariant = hasVariants ? product.product_variants[0] : null;
            const displayPrice = firstVariant?.price || product.price;
            const originalPrice = firstVariant?.original_price || displayPrice * 1.5;
            const discount = firstVariant?.discount_percentage || Math.round((originalPrice - displayPrice) / originalPrice * 100);
            return <Link key={product.id} to={`/product/${product.id}`} className="flex-shrink-0 w-32 sm:w-36 md:w-40 bg-card rounded-lg overflow-hidden hover:shadow-md hover:border-destructive border border-transparent transition-all group">
                  <div className="relative aspect-square bg-muted">
                    <img src={product.image || '/placeholder.svg'} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <div className="absolute top-0 left-0 bg-yellow-400 text-destructive text-[10px] sm:text-xs font-bold px-2 py-1 rounded-br">
                      -{discount}%
                    </div>
                  </div>
                  <div className="p-2 sm:p-2.5">
                    <h3 className="text-xs sm:text-sm font-medium text-foreground line-clamp-2 mb-1.5 min-h-[2.5rem] leading-tight">
                      {product.title}
                    </h3>
                    <div className="space-y-1">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-destructive font-bold text-base sm:text-lg">
                            {formatPrice(displayPrice)}
                          </span>
                        </div>
                        <div className="text-[10px] sm:text-xs text-muted-foreground line-through">
                          {formatPrice(originalPrice)}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <div className="flex-1 bg-destructive/20 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-destructive h-full rounded-full transition-all" style={{
                        width: '45%'
                      }} />
                        </div>
                        <span className="text-[9px] text-destructive-foreground font-medium bg-destructive/80 px-1.5 py-0.5 rounded whitespace-nowrap">
                          Đã bán 45
                        </span>
                      </div>
                      <div className="bg-orange-500 text-white text-[10px] sm:text-xs font-bold text-center py-1.5 rounded mt-1.5">
                        ĐANG BÁN CHẠY
                      </div>
                    </div>
                  </div>
                </Link>;
          })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>;
};
export default FlashSaleSection;