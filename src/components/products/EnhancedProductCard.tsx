import { Link } from "react-router-dom";
import { Star, ShoppingCart, Eye, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ProductCardProps } from "./ProductCard";

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', { 
    style: 'currency', 
    currency: 'VND',
    maximumFractionDigits: 0 
  }).format(price);
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
  const discountedPrice = discount ? price.min * (1 - discount / 100) : price.min;
  const soldCount = Math.floor(Math.random() * 2000) + 100; // Mock sold count

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

        {/* Quick actions on hover - Desktop only */}
        <div className="hidden md:flex absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex-col gap-2 z-10">
          <Button size="icon" variant="secondary" className="h-8 w-8 bg-background/90 hover:bg-background rounded-full shadow-md">
            <Heart className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="secondary" className="h-8 w-8 bg-background/90 hover:bg-background rounded-full shadow-md">
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <CardContent className="p-2 md:p-3">
        <div className="space-y-1 md:space-y-2">
          <Badge variant="outline" className="text-[9px] md:text-[10px] px-1 md:px-1.5 py-0 md:py-0.5">
            {category}
          </Badge>
          
          <Link to={`/product/${id}`}>
            <h3 className="font-medium text-xs md:text-sm text-foreground line-clamp-2 hover:text-primary transition-colors leading-tight min-h-[2rem] md:min-h-[2.5rem]">
              {title}
            </h3>
          </Link>

          <div className="flex items-center gap-0.5 md:gap-1 flex-wrap">
            <div className="flex">
              {Array(5).fill(0).map((_, i) => (
                <Star 
                  key={i}
                  className={`h-2.5 w-2.5 md:h-3 md:w-3 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-muted"}`}
                />
              ))}
            </div>
            <span className="text-[9px] md:text-xs text-muted-foreground">
              {rating.toFixed(1)}
            </span>
            <span className="text-[9px] md:text-xs text-muted-foreground hidden md:inline">|</span>
            <span className="text-[9px] md:text-xs text-muted-foreground">
              {soldCount >= 1000 ? `${(soldCount / 1000).toFixed(1)}k` : soldCount}
            </span>
          </div>

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
