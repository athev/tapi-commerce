import { Link } from "react-router-dom";
import { Star, ShoppingCart, Heart, CheckCircle2, AlertCircle, Shield } from "lucide-react";
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

const getComplaintRateColor = (rate: number) => {
  if (rate < 1) return "text-green-600 bg-green-50 border-green-200";
  if (rate < 3) return "text-yellow-600 bg-yellow-50 border-yellow-200";
  return "text-red-600 bg-red-50 border-red-200";
};

const getStockColor = (stock: number) => {
  if (stock > 10) return "text-green-600";
  if (stock >= 5) return "text-yellow-600";
  return "text-red-600";
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
  const displayComplaintRate = complaintRate;
  const displayStock = inStock ?? 999;
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
            
            {/* Top badges */}
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

            {/* Bottom badges overlay - Warranty badge */}
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
              {hasVoucher && (
                <Badge className="bg-orange-500 text-white text-[8px] px-1 py-0 h-4">
                  VOUCHER
                </Badge>
              )}
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
          {/* Digital Product Badges Row */}
          <div className="flex items-center gap-1 flex-wrap">
            {seller.verified && (
              <Badge className="bg-red-500 text-white text-[8px] md:text-[9px] px-1 py-0 h-4">
                Mall
              </Badge>
            )}
            {favoritesCount > 100 && (
              <Badge className="bg-red-50 text-red-600 border border-red-200 text-[8px] md:text-[9px] px-1 py-0 h-4">
                Yêu thích
              </Badge>
            )}
            {/* Discount badge */}
            {discount && discount > 0 && (
              <Badge className="bg-red-500 text-white text-[8px] md:text-[9px] px-1 py-0 h-4 font-bold">
                -{discount}%
              </Badge>
            )}
            {/* Sales count badge */}
            {displaySoldCount > 0 && (
              <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 text-[8px] md:text-[9px] px-1 py-0 h-4">
                {formatSoldCount(displaySoldCount)} đã bán
              </Badge>
            )}
            {/* Rating badge */}
            {displayReviews > 0 && (
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 text-[8px] md:text-[9px] px-1 py-0 h-4">
                ⭐ {displayRating.toFixed(1)}
              </Badge>
            )}
          </div>

          {/* Category Badge */}
          <Badge variant="outline" className="text-[9px] md:text-[10px] px-1 md:px-1.5 py-0 md:py-0.5">
            {category}
          </Badge>
          
          {/* Title */}
          <Link to={`/product/${id}`}>
            <h3 className="font-medium text-xs md:text-sm text-foreground line-clamp-2 hover:text-primary transition-colors leading-tight min-h-[2rem] md:min-h-[2.5rem]">
              {title}
            </h3>
          </Link>

          {/* Rating, Reviews, Sold - Desktop details */}
          <div className="hidden md:flex items-center gap-1 flex-wrap text-[9px] md:text-xs">
            <div className="flex items-center gap-0.5">
              <div className="flex">
                {Array(5).fill(0).map((_, i) => (
                  <Star 
                    key={i}
                    className={`h-2.5 w-2.5 md:h-3 md:w-3 ${i < Math.round(displayRating) ? "fill-yellow-400 text-yellow-400" : "text-muted"}`}
                  />
                ))}
              </div>
              <span className="font-semibold text-yellow-700">{displayRating.toFixed(1)}</span>
            </div>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">
              {displayReviews > 0 ? `${displayReviews} đánh giá` : "Chưa có đánh giá"}
            </span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">
              {displaySoldCount > 0 ? `Đã bán: ${formatSoldCount(displaySoldCount)}` : "Mới"}
            </span>
          </div>

          {/* Complaint Rate & Stock - Desktop only */}
          <div className="hidden md:flex items-center gap-1.5 flex-wrap text-[10px]">
            <Badge variant="outline" className={cn("px-1.5 py-0.5 border font-medium", getComplaintRateColor(displayComplaintRate))}>
              {displayComplaintRate < 1 ? <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" /> : <AlertCircle className="h-2.5 w-2.5 mr-0.5" />}
              Khiếu nại: {displayComplaintRate.toFixed(1)}%
            </Badge>
            <span className={cn("font-medium", getStockColor(displayStock))}>
              Kho: {displayStock}
            </span>
          </div>

          {/* Seller Info */}
          <div className="flex items-center gap-1 text-[9px] md:text-[10px] text-muted-foreground">
            <span className="truncate max-w-[120px]">{seller.name}</span>
            {sellerOnline && (
              <>
                <span>•</span>
                <Badge className="bg-green-500/10 text-green-700 border-green-200 text-[8px] md:text-[9px] px-1 py-0 h-3.5">
                  <span className="w-1 h-1 bg-green-500 rounded-full mr-0.5 animate-pulse" />
                  Online
                </Badge>
              </>
            )}
            {seller?.verified && (
              <>
                <span>•</span>
                <Badge className="bg-blue-500/10 text-blue-700 border-blue-200 text-[8px] md:text-[9px] px-1 py-0 h-3.5">
                  ✓
                </Badge>
              </>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-2 md:p-3 pt-0 flex flex-col gap-1 md:gap-2">
        <div className="w-full">
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
        </div>
        
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