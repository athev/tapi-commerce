import { Link } from "react-router-dom";
import { Star, ShoppingCart, Eye, Heart, CheckCircle2, AlertCircle } from "lucide-react";
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
}: ProductCardProps) => {
  const { toggleFavorite, isFavorite } = useFavorites();
  const favorited = isFavorite(id);
  const discountedPrice = discount ? price.min * (1 - discount / 100) : price.min;
  
  // Mock data with realistic values
  const soldCount = Math.floor(Math.random() * 2000) + 100;
  const complaintRate = Math.random() * 2; // 0-2%
  const reviewCount = reviews || Math.floor(Math.random() * 200) + 50;
  const stockCount = inStock || Math.floor(Math.random() * 50) + 5;
  const sellerOnline = Math.random() > 0.3; // 70% online

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
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-300" />
            
            {/* Badges - Simplified for mobile */}
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
              {seller.verified && (
                <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold text-[9px] md:text-xs px-1 md:px-2 py-0.5 md:py-1">
                  Mall
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

          {/* Rating, Reviews, Sold */}
          <div className="flex items-center gap-1 flex-wrap text-[9px] md:text-xs">
            <div className="flex items-center gap-0.5">
              <div className="flex">
                {Array(5).fill(0).map((_, i) => (
                  <Star 
                    key={i}
                    className={`h-2.5 w-2.5 md:h-3 md:w-3 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-muted"}`}
                  />
                ))}
              </div>
              <span className="font-semibold text-yellow-700">{rating.toFixed(1)}</span>
            </div>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">{reviewCount} đánh giá</span>
            <span className="text-muted-foreground hidden md:inline">•</span>
            <span className="text-muted-foreground hidden md:inline">Đã bán: {formatSoldCount(soldCount)}</span>
          </div>

          {/* Complaint Rate & Stock - Desktop only */}
          <div className="hidden md:flex items-center gap-1.5 flex-wrap text-[10px]">
            <Badge variant="outline" className={cn("px-1.5 py-0.5 border font-medium", getComplaintRateColor(complaintRate))}>
              {complaintRate < 1 ? <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" /> : <AlertCircle className="h-2.5 w-2.5 mr-0.5" />}
              Khiếu nại: {complaintRate.toFixed(1)}%
            </Badge>
            <span className={cn("font-medium", getStockColor(stockCount))}>
              Kho: {stockCount}
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
            {seller.verified && (
              <>
                <span>•</span>
                <Badge className="bg-blue-500/10 text-blue-700 border-blue-200 text-[8px] md:text-[9px] px-1 py-0 h-3.5">
                  ✓
                </Badge>
              </>
            )}
          </div>

          {/* Trust Badges - Desktop */}
          <div className="hidden md:flex items-center gap-1 flex-wrap">
            <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary border-primary/20">
              Free ship
            </Badge>
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
