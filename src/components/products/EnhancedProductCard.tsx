import { Link } from "react-router-dom";
import { ShoppingCart, Heart, Shield, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ProductCardProps } from "./ProductCard";
import { cn } from "@/lib/utils";
import { useFavorites } from "@/hooks/useFavorites";

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', { 
    style: 'currency', 
    currency: 'VND',
    maximumFractionDigits: 0 
  }).format(price);
};

const formatSoldCount = (count: number) => {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return count.toString();
};

// Helper: Convert warranty_period to display text
const getWarrantyText = (warrantyPeriod: string): string | null => {
  if (!warrantyPeriod || warrantyPeriod === 'none') return null;
  if (warrantyPeriod === 'lifetime') return 'Trọn đời';
  if (warrantyPeriod === '7_days') return '7 ngày';
  if (warrantyPeriod === '14_days') return '14 ngày';
  if (warrantyPeriod === '1_month') return '1 tháng';
  if (warrantyPeriod === '3_months') return '3 tháng';
  if (warrantyPeriod === '6_months') return '6 tháng';
  
  // Custom format: X_days or X_months
  const daysMatch = warrantyPeriod.match(/^(\d+)_days$/);
  if (daysMatch) return `${daysMatch[1]} ngày`;
  
  const monthsMatch = warrantyPeriod.match(/^(\d+)_months$/);
  if (monthsMatch) return `${monthsMatch[1]} tháng`;
  
  return null;
};

// Helper: Get warranty badge style based on tier
const getWarrantyBadgeStyle = (warrantyPeriod: string): string => {
  if (warrantyPeriod === 'lifetime') {
    // PREMIUM TIER - Gold gradient for lifetime warranty
    return "bg-gradient-to-r from-amber-400 to-yellow-500 text-white font-bold shadow-sm";
  }
  if (warrantyPeriod === '6_months' || warrantyPeriod === '3_months') {
    // HIGH TIER - Dark green
    return "bg-emerald-600 text-white";
  }
  // STANDARD TIER - Light green
  return "bg-emerald-500 text-white";
};

interface EnhancedProductCardProps extends ProductCardProps {
  soldCount?: number;
  complaintRate?: number;
  averageRating?: number;
  reviewCount?: number;
  sellerOnline?: boolean;
  warrantyPeriod?: string;
  favoritesCount?: number;
  hasVoucher?: boolean;
}

const EnhancedProductCard = ({
  id,
  title,
  price,
  image,
  category,
  rating,
  reviews,
  seller,
  inStock,
  isNew,
  isHot,
  discount,
  soldCount = 0,
  complaintRate = 0,
  averageRating,
  reviewCount = 0,
  sellerOnline = false,
  warrantyPeriod,
  favoritesCount = 0,
  hasVoucher = false,
}: EnhancedProductCardProps) => {
  const { toggleFavorite, isFavorite } = useFavorites();
  const favorited = isFavorite(id);
  const discountedPrice = discount ? price.min * (1 - discount / 100) : price.min;
  
  // Use real data from props
  const displayRating = averageRating ?? rating ?? 5;
  const displayReviews = reviewCount || reviews || 0;
  const displaySoldCount = soldCount;
  const warrantyText = getWarrantyText(warrantyPeriod || '');

  return (
    <Card className="group bg-card border border-border rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="relative">
        <Link to={`/product/${id}`}>
          <div className="aspect-square relative overflow-hidden bg-muted">
            <img 
              src={image} 
              alt={title}
              className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
              loading="lazy"
              onError={(e) => {
                console.error('❌ Image failed to load:', {
                  productId: id,
                  productTitle: title,
                  imageUrl: image,
                  timestamp: new Date().toISOString()
                });
                e.currentTarget.src = '/placeholder.svg';
              }}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-300" />
            
            {/* Top left badges - Discount */}
            <div className="absolute top-1 md:top-2 left-1 md:left-2 flex flex-wrap gap-0.5 md:gap-1 max-w-[80%] z-10">
              {discount && (
                <Badge className="bg-destructive text-destructive-foreground font-bold text-[10px] md:text-sm px-1 md:px-2 py-0.5 md:py-1">
                  -{discount}%
                </Badge>
              )}
              {isHot && (
                <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-[9px] md:text-xs px-1 md:px-2 py-0.5 md:py-1">
                  🔥
                </Badge>
              )}
            </div>

            {/* Bottom badges overlay - Warranty & Digital product badges */}
            <div className="absolute bottom-1 left-1 flex flex-wrap gap-0.5 max-w-[95%] z-10">
              {warrantyText && (
                <Badge className={cn(
                  "text-[8px] px-1.5 py-0 h-4 flex items-center gap-0.5",
                  getWarrantyBadgeStyle(warrantyPeriod || '')
                )}>
                  <Shield className="h-2.5 w-2.5" />
                  {warrantyPeriod === 'lifetime' ? 'BH Trọn đời' : `BH ${warrantyText}`}
                </Badge>
              )}
              {/* Digital product badge - Instant delivery */}
              <Badge className="bg-green-500 text-white text-[8px] px-1 py-0 h-4 flex items-center gap-0.5">
                <Zap className="h-2.5 w-2.5" />
                Giao ngay
              </Badge>
            </div>
          </div>
        </Link>

        {/* Favorite Button - Always visible */}
        <Button
          size="icon"
          variant="secondary"
          className={cn(
            "absolute top-2 right-2 h-8 w-8 rounded-full shadow-md transition-all z-10",
            favorited 
              ? "bg-red-50 hover:bg-red-100 text-red-500" 
              : "bg-background/90 hover:bg-background"
          )}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite(id);
          }}
        >
          <Heart 
            className={cn(
              "h-4 w-4 transition-all",
              favorited && "fill-red-500"
            )} 
          />
        </Button>
      </div>

      <CardContent className="p-2 md:p-3">
        <div className="space-y-1 md:space-y-1.5">
          {/* Category Badge - Prominent */}
          <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] md:text-[10px] px-1.5 py-0.5 font-medium">
            {category}
          </Badge>
          
          {/* Title */}
          <Link to={`/product/${id}`}>
            <h3 className="font-medium text-xs md:text-sm text-foreground line-clamp-2 hover:text-primary transition-colors leading-tight min-h-[2rem] md:min-h-[2.5rem]">
              {title}
            </h3>
          </Link>

          {/* Price */}
          <div className="flex items-baseline gap-1 md:gap-2">
            <span className="font-bold text-sm md:text-lg text-destructive">
              {formatPrice(discountedPrice)}
            </span>
            {discount && (
              <span className="text-[10px] md:text-xs text-muted-foreground line-through">
                {formatPrice(price.min)}
              </span>
            )}
          </div>

          {/* Shopee-style stats line */}
          <div className="flex items-center gap-1.5 text-[10px] md:text-xs text-muted-foreground">
            {displayReviews > 0 ? (
              <>
                <span className="text-yellow-600 font-medium">⭐ {displayRating.toFixed(1)}</span>
                <span className="text-muted-foreground/50">|</span>
                <span>Đã bán {formatSoldCount(displaySoldCount)}</span>
              </>
            ) : (
              <>
                <span>Chưa có đánh giá</span>
                <span className="text-muted-foreground/50">|</span>
                <span>{displaySoldCount > 0 ? `Đã bán ${formatSoldCount(displaySoldCount)}` : 'Mới'}</span>
              </>
            )}
          </div>

          {/* Seller Info - Simplified */}
          <div className="text-[9px] md:text-[10px] text-muted-foreground truncate">
            {seller.name}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-2 md:p-3 pt-0">
        <Button 
          size="sm" 
          className="w-full h-7 md:h-8 text-xs md:text-sm bg-primary hover:bg-primary/90 text-primary-foreground"
          asChild
        >
          <Link to={`/product/${id}`}>
            <ShoppingCart className="h-2.5 w-2.5 md:h-3 md:w-3 mr-1" />
            Mua ngay
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EnhancedProductCard;
