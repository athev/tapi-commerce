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
            
            {/* Badges - All on left side */}
            <div className="absolute top-2 left-2 flex flex-wrap gap-1 max-w-[80%] z-10">
              {discount && (
                <Badge className="bg-destructive text-destructive-foreground font-bold text-sm px-2 py-1">
                  -{discount}%
                </Badge>
              )}
              {isHot && (
                <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs px-2 py-1">
                  🔥 Hot
                </Badge>
              )}
              {isNew && (
                <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs px-2 py-1">
                  ✨ Mới
                </Badge>
              )}
              {seller.verified && (
                <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold text-xs px-2 py-1">
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

      <CardContent className="p-3">
        <div className="space-y-2">
          <Badge variant="outline" className="text-[10px] px-1.5 py-0.5">
            {category}
          </Badge>
          
          <Link to={`/product/${id}`}>
            <h3 className="font-medium text-sm text-foreground line-clamp-2 hover:text-primary transition-colors leading-tight min-h-[2.5rem]">
              {title}
            </h3>
          </Link>

          <div className="flex items-center gap-1">
            <div className="flex">
              {Array(5).fill(0).map((_, i) => (
                <Star 
                  key={i}
                  className={`h-3 w-3 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-muted"}`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              {rating.toFixed(1)}
            </span>
            <span className="text-xs text-muted-foreground">|</span>
            <span className="text-xs text-muted-foreground">
              Đã bán {soldCount >= 1000 ? `${(soldCount / 1000).toFixed(1)}k` : soldCount}
            </span>
          </div>

          <div className="flex items-center gap-1 flex-wrap">
            <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary border-primary/20">
              Free ship
            </Badge>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0.5">
              Trả góp 0%
            </Badge>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-3 pt-0 flex flex-col gap-2">
        <div className="w-full">
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-lg text-destructive">
              {formatPrice(discountedPrice)}
            </span>
            {discount && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(price.min)}
              </span>
            )}
          </div>
          {price.max > price.min && (
            <span className="text-xs text-muted-foreground">
              {formatPrice(price.max)}
            </span>
          )}
        </div>
        
        <Button 
          size="sm" 
          className="w-full h-8 bg-primary hover:bg-primary/90 text-primary-foreground"
          asChild
        >
          <Link to={`/product/${id}`}>
            <ShoppingCart className="h-3 w-3 mr-1" />
            Mua ngay
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EnhancedProductCard;
