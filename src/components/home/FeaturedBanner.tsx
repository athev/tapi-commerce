import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const FeaturedBanner = () => {
  const { data: featuredProduct, isLoading } = useQuery({
    queryKey: ['featured-product-banner'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'active')
        .order('quality_score', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      return data;
    }
  });

  if (isLoading || !featuredProduct) {
    return null;
  }

  return (
    <section className="py-4">
      <div className="container mx-auto px-4">
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 min-h-[180px] md:min-h-[220px]">
          {/* Background Image */}
          {featuredProduct.image && (
            <div 
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `url(${featuredProduct.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
          )}
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-transparent" />

          {/* Content */}
          <div className="relative flex items-center h-full min-h-[180px] md:min-h-[220px] p-6 md:p-8">
            <div className="max-w-md">
              {/* Badge */}
              <span className="inline-block bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
                BEST SELLER
              </span>

              {/* Title */}
              <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-2 line-clamp-2">
                {featuredProduct.title}
              </h3>

              {/* Divider */}
              <div className="w-16 h-0.5 bg-orange-500 mb-3" />

              {/* Description */}
              <p className="text-sm text-white/70 line-clamp-2 mb-4">
                {featuredProduct.description || featuredProduct.meta_description || "Sản phẩm bán chạy nhất trên TAPI"}
              </p>

              {/* CTA Button */}
              <Link to={`/product/${featuredProduct.slug || featuredProduct.id}`}>
                <Button 
                  variant="outline" 
                  className="bg-white/10 border-white/30 text-white hover:bg-white hover:text-slate-900 transition-all"
                >
                  Xem ngay
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* Product Image on Right (Desktop) */}
            <div className="hidden md:block absolute right-8 top-1/2 -translate-y-1/2">
              <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-xl overflow-hidden shadow-2xl border-2 border-white/20">
                <img
                  src={featuredProduct.image || '/placeholder.svg'}
                  alt={featuredProduct.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedBanner;
