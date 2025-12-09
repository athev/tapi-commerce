import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Shield, Package, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ViewMode } from "./ShopProductFilters";

interface Product {
  id: string;
  title: string;
  price: number;
  image?: string;
  slug?: string;
  category: string;
  average_rating?: number;
  review_count?: number;
  purchases?: number;
  warranty_period?: string;
  in_stock?: number;
}

interface ShopProductGridProps {
  products: Product[];
  viewMode: ViewMode;
  isLoading?: boolean;
}

const ShopProductGrid = ({ products, viewMode, isLoading }: ShopProductGridProps) => {
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatSales = (sales: number) => {
    if (sales >= 1000) {
      return `${(sales / 1000).toFixed(1)}k`;
    }
    return sales.toString();
  };

  const getWarrantyLabel = (period?: string) => {
    if (!period || period === 'none') return null;
    if (period === 'lifetime') return 'BH Trọn đời';
    
    const match = period.match(/(\d+)_(days|months)/);
    if (match) {
      const [, num, unit] = match;
      return unit === 'days' ? `BH ${num} ngày` : `BH ${num} tháng`;
    }
    return null;
  };

  const getGridCols = () => {
    switch (viewMode) {
      case 'grid-2':
        return 'grid-cols-2';
      case 'grid-3':
        return 'grid-cols-2 md:grid-cols-3';
      case 'grid-4':
        return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
      default:
        return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
    }
  };

  if (isLoading) {
    return (
      <div className="mx-4 md:mx-8 mt-4">
        <div className={cn("grid gap-3 md:gap-4", getGridCols())}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="overflow-hidden animate-pulse">
              <div className="aspect-square bg-muted" />
              <CardContent className="p-3">
                <div className="h-4 bg-muted rounded mb-2" />
                <div className="h-4 bg-muted rounded w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="mx-4 md:mx-8 mt-4">
        <Card className="p-12 text-center">
          <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Chưa có sản phẩm</h3>
          <p className="text-muted-foreground">
            Gian hàng đang cập nhật sản phẩm...
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-4 md:mx-8 mt-4 mb-8">
      <div className={cn("grid gap-3 md:gap-4", getGridCols())}>
        {products.map((product) => {
          const warrantyLabel = getWarrantyLabel(product.warranty_period);
          const isLifetime = product.warranty_period === 'lifetime';
          const isOutOfStock = (product.in_stock || 0) <= 0;

          return (
            <Link 
              key={product.id} 
              to={`/product/${product.slug || product.id}`}
              className="block"
            >
              <Card className={cn(
                "overflow-hidden h-full transition-all duration-300",
                "hover:shadow-lg hover:-translate-y-1",
                isOutOfStock && "opacity-60"
              )}>
                {/* Product Image */}
                <div className="relative aspect-square overflow-hidden bg-muted">
                  <img
                    src={product.image || '/placeholder.svg'}
                    alt={product.title}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    loading="lazy"
                  />
                  
                  {/* Out of Stock Overlay */}
                  {isOutOfStock && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Badge variant="secondary" className="bg-background/90 text-foreground">
                        Hết hàng
                      </Badge>
                    </div>
                  )}
                  
                  {/* Category Badge */}
                  <Badge 
                    className="absolute top-2 left-2 bg-primary/90 hover:bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5"
                  >
                    {product.category}
                  </Badge>
                  
                  {/* Digital Product Badge */}
                  <Badge 
                    variant="secondary"
                    className="absolute top-2 right-2 bg-background/90 text-foreground text-[10px] px-1.5 py-0.5 flex items-center gap-1"
                  >
                    <Zap className="h-3 w-3" />
                    Giao ngay
                  </Badge>
                </div>

                {/* Product Info */}
                <CardContent className="p-3">
                  {/* Title */}
                  <h3 className="font-medium text-sm line-clamp-2 mb-2 min-h-[2.5rem] text-foreground">
                    {product.title}
                  </h3>

                  {/* Warranty Badge */}
                  {warrantyLabel && (
                    <Badge 
                      variant="outline"
                      className={cn(
                        "text-[10px] px-1.5 py-0 mb-2 flex items-center gap-1 w-fit",
                        isLifetime 
                          ? "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/50 text-yellow-700" 
                          : "bg-green-50 border-green-200 text-green-700"
                      )}
                    >
                      <Shield className="h-3 w-3" />
                      {warrantyLabel}
                    </Badge>
                  )}

                  {/* Price */}
                  <div className="text-lg font-bold text-primary mb-2">
                    {formatPrice(product.price)}
                  </div>

                  {/* Rating & Sales */}
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                    <span>{(product.average_rating || 5).toFixed(1)}</span>
                    <span className="mx-1.5">|</span>
                    <span>Đã bán {formatSales(product.purchases || 0)}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default ShopProductGrid;
