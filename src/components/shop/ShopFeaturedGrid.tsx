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

  // Get top 4 products for grid display
  const gridProducts = products.slice(0, 4);

  if (gridProducts.length === 0) return null;

  const getBadge = (product: Product, index: number) => {
    if (index === 0) {
      return {
        icon: <Flame className="h-3 w-3" />,
        text: "HOT",
        className: "bg-gradient-to-r from-red-500 to-orange-500"
      };
    }
    if ((product.purchases || 0) > 50) {
      return {
        icon: <TrendingUp className="h-3 w-3" />,
        text: "Bán chạy",
        className: "bg-gradient-to-r from-green-500 to-emerald-500"
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
    <div className="bg-card rounded-lg p-3">
      <h3 className="text-sm font-semibold text-foreground mb-3">{title}</h3>
      
      <div className="grid grid-cols-2 gap-2">
        {gridProducts.map((product, index) => {
          const badge = getBadge(product, index);
          
          return (
            <Link
              key={product.id}
              to={product.slug ? `/product/${product.slug}` : `/product/id/${product.id}`}
              className={cn(
                "relative bg-muted rounded-lg overflow-hidden group hover:shadow-lg transition-all",
                index === 0 && gridProducts.length > 1 && "col-span-2 sm:col-span-1"
              )}
            >
              {/* Product Image */}
              <div className="relative aspect-square">
                <img
                  src={product.image || '/placeholder.svg'}
                  alt={product.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Badge */}
                {badge && (
                  <div className={cn(
                    "absolute top-2 left-2 flex items-center gap-1 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md",
                    badge.className
                  )}>
                    {badge.icon}
                    <span>{badge.text}</span>
                  </div>
                )}

                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              {/* Product Info */}
              <div className="p-2.5">
                <h4 className="text-sm font-medium text-foreground line-clamp-2 mb-1.5 group-hover:text-primary transition-colors">
                  {product.title}
                </h4>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-primary">
                    {formatPrice(product.price)}
                  </span>
                  
                  {(product.purchases || 0) > 0 && (
                    <span className="text-xs text-muted-foreground">
                      Đã bán {product.purchases}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default ShopFeaturedGrid;
