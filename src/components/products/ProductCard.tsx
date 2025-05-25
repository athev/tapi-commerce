
import { Link } from "react-router-dom";
import { Star, ShoppingCart, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

export interface ProductCardProps {
  id: string;
  title: string;
  price: {
    min: number;
    max: number;
  };
  image: string;
  category: string;
  rating: number;
  reviews: number;
  seller: {
    name: string;
    verified: boolean;
  };
  inStock: number;
  isNew?: boolean;
  isHot?: boolean;
  discount?: number;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', { 
    style: 'currency', 
    currency: 'VND',
    maximumFractionDigits: 0 
  }).format(price);
};

const ProductCard = ({
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
  return (
    <Card className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="relative">
        <Link to={`/product/${id}`}>
          <div className="aspect-square relative overflow-hidden bg-gray-50">
            <img 
              src={image} 
              alt={title}
              className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-300" />
            
            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1">
              {isNew && (
                <Badge className="bg-orange-500 hover:bg-orange-600 text-white text-xs px-2 py-1">
                  Mới
                </Badge>
              )}
              {isHot && (
                <Badge className="bg-red-500 hover:bg-red-600 text-white text-xs px-2 py-1">
                  Hot
                </Badge>
              )}
            </div>
            
            {discount && (
              <Badge className="absolute top-3 right-3 bg-blue-500 hover:bg-blue-600 text-white text-xs px-2 py-1">
                -{discount}%
              </Badge>
            )}
          </div>
        </Link>

        {/* Quick actions on hover */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex flex-col gap-2">
            <Button size="sm" variant="secondary" className="w-8 h-8 p-0 bg-white/90 hover:bg-white">
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="space-y-3">
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 text-xs">
            {category}
          </Badge>
          
          <Link to={`/product/${id}`}>
            <h3 className="font-medium text-gray-900 line-clamp-2 hover:text-marketplace-primary transition-colors leading-tight">
              {title}
            </h3>
          </Link>

          <div className="flex items-center gap-1">
            <div className="flex">
              {Array(5).fill(0).map((_, i) => (
                <Star 
                  key={i}
                  className={`h-3 w-3 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500">({reviews})</span>
          </div>

          <div className="flex items-center gap-1 text-sm">
            <span className="text-gray-500">Người bán:</span>
            <span className="font-medium text-gray-700 flex items-center text-sm">
              {seller.name}
              {seller.verified && (
                <span className="ml-1 text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">✓</span>
              )}
            </span>
          </div>

          <div className="text-sm text-gray-500">
            Còn lại: <span className="font-medium text-gray-700">{inStock}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <div className="font-bold text-lg text-marketplace-primary">
          {formatPrice(price.min)}
          {price.max > price.min && (
            <span className="text-sm text-gray-500 font-normal"> - {formatPrice(price.max)}</span>
          )}
        </div>
        
        <Button size="sm" className="bg-marketplace-primary hover:bg-marketplace-primary/90 text-white">
          <ShoppingCart className="h-4 w-4 mr-1" />
          Mua ngay
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
