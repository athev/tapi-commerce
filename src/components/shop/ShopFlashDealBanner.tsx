import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Zap, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Product {
  id: string;
  title: string;
  price: number;
  image: string | null;
  slug: string | null;
}

interface ProductVariant {
  id: string;
  product_id: string;
  discount_percentage: number | null;
  original_price: number | null;
  price: number;
}

interface ShopFlashDealBannerProps {
  sellerId: string;
}

const ShopFlashDealBanner = ({ sellerId }: ShopFlashDealBannerProps) => {
  const [dealProducts, setDealProducts] = useState<(Product & { discount: number })[]>([]);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const fetchDeals = async () => {
      // Get products with discounted variants
      const { data: variants } = await supabase
        .from('product_variants')
        .select(`
          id,
          product_id,
          discount_percentage,
          original_price,
          price
        `)
        .gt('discount_percentage', 0)
        .eq('is_active', true)
        .limit(10);

      if (!variants || variants.length === 0) return;

      // Get product details for these variants
      const productIds = [...new Set(variants.map(v => v.product_id))];
      
      const { data: products } = await supabase
        .from('products')
        .select('id, title, price, image, slug')
        .eq('seller_id', sellerId)
        .in('id', productIds)
        .eq('status', 'active')
        .limit(3);

      if (products) {
        const dealsWithDiscount = products.map(product => {
          const variant = variants.find(v => v.product_id === product.id);
          return {
            ...product,
            discount: variant?.discount_percentage || 0
          };
        }).filter(p => p.discount > 0).slice(0, 3);

        setDealProducts(dealsWithDiscount);
      }
    };

    fetchDeals();
  }, [sellerId]);

  // Countdown timer - reset at midnight
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      
      const diff = endOfDay.getTime() - now.getTime();
      
      return {
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000)
      };
    };

    setTimeLeft(calculateTimeLeft());
    
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(price);
  };

  if (dealProducts.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 rounded-lg p-3 sm:p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-white fill-white" />
          <span className="text-white font-bold text-base sm:text-lg">Flash Deal</span>
        </div>
        
        {/* Countdown */}
        <div className="flex items-center gap-1.5 bg-black/20 rounded-lg px-2 py-1">
          <Clock className="h-3.5 w-3.5 text-white" />
          <div className="flex items-center gap-1 text-white text-sm font-mono">
            <span className="bg-white/20 rounded px-1.5 py-0.5">
              {String(timeLeft.hours).padStart(2, '0')}
            </span>
            <span>:</span>
            <span className="bg-white/20 rounded px-1.5 py-0.5">
              {String(timeLeft.minutes).padStart(2, '0')}
            </span>
            <span>:</span>
            <span className="bg-white/20 rounded px-1.5 py-0.5">
              {String(timeLeft.seconds).padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>

      {/* Deal Products */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {dealProducts.map((product) => (
          <Link
            key={product.id}
            to={product.slug ? `/product/${product.slug}` : `/product/id/${product.id}`}
            className="flex-shrink-0 w-[100px] sm:w-[120px] bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="relative aspect-square">
              <img
                src={product.image || '/placeholder.svg'}
                alt={product.title}
                className="w-full h-full object-cover"
              />
              <span className="absolute top-1 left-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded">
                -{product.discount}%
              </span>
            </div>
            <div className="p-2">
              <p className="text-xs text-foreground font-medium line-clamp-1">
                {product.title}
              </p>
              <p className="text-xs text-red-500 font-bold mt-0.5">
                {formatPrice(product.price)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ShopFlashDealBanner;
