import { Link } from "react-router-dom";
import { Flame, Star, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface Product {
  id: string;
  title: string;
  price: number;
  image: string | null;
  slug: string | null;
  purchases?: number;
  average_rating?: number | null;
}

interface ShopFeaturedGridProps {
  products: Product[];
  title?: string;
}

const ShopFeaturedGrid = ({ products, title = "Sản phẩm đề xuất" }: ShopFeaturedGridProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(price);
  };

  // Get first 2 featured products for large cards
  const featuredProducts = products.slice(0, 2);

  if (featuredProducts.length === 0) return null;

  const getBadge = (product: Product, index: number) => {
    if (index === 0) {
      return {
        icon: <Flame className="h-3 w-3" />,
        text: "HOT",
        className: "bg-gradient-to-r from-red-500 to-orange-500"
      };
    }
    if ((product.average_rating || 0) >= 4.5) {
      return {
        icon: <Star className="h-3 w-3 fill-current" />,
        text: "Yêu thích",
        className: "bg-gradient-to-r from-yellow-500 to-amber-500"
      };
    }
    return null;
  };

  return (
    <div className="bg-card rounded-lg p-4">
      <h3 className="text-sm font-semibold text-foreground mb-4">{title}</h3>
      
      {/* 2 Large Featured Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {featuredProducts.map((product, index) => {
          const badge = getBadge(product, index);
          const gradientBg = index === 0 
            ? "bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-700"
            : "bg-gradient-to-br from-amber-400 via-orange-500 to-red-500";
          
          return (
            <Link
              key={product.id}
              to={product.slug ? `/product/${product.slug}` : `/product/id/${product.id}`}
              className={cn(
                "relative rounded-xl overflow-hidden group",
                gradientBg,
                "aspect-[2/1] md:aspect-[2.5/1]"
              )}
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
              </div>
              
              {/* Content */}
              <div className="absolute inset-0 p-4 flex items-center justify-between">
                {/* Left: Product Info */}
                <div className="flex-1 pr-4 z-10">
                  {/* Badge */}
                  {badge && (
                    <div className={cn(
                      "inline-flex items-center gap-1 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg mb-2",
                      badge.className
                    )}>
                      {badge.icon}
                      <span>{badge.text}</span>
                    </div>
                  )}
                  
                  <h4 className="text-white font-bold text-base md:text-lg line-clamp-2 mb-2 drop-shadow-md">
                    {product.title}
                  </h4>
                  
                  <div className="flex items-baseline gap-2">
                    <span className="text-white font-bold text-lg md:text-xl drop-shadow-md">
                      {formatPrice(product.price)}
                    </span>
                    {(product.purchases || 0) > 0 && (
                      <span className="text-white/80 text-xs">
                        Đã bán {product.purchases}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Right: Product Image */}
                <div className="w-24 h-24 md:w-32 md:h-32 flex-shrink-0">
                  <img
                    src={product.image || '/placeholder.svg'}
                    alt={product.title}
                    className="w-full h-full object-cover rounded-lg shadow-xl group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>
              
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default ShopFeaturedGrid;
