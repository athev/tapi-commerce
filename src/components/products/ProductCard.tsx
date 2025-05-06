
import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
    <Card className="overflow-hidden card-hover">
      <Link to={`/product/${id}`}>
        <div className="aspect-square relative overflow-hidden">
          <img 
            src={image} 
            alt={title}
            className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
          />
          {isNew && (
            <span className="badge-new absolute top-2 left-2">Mới</span>
          )}
          {isHot && (
            <span className="badge-hot absolute top-2 left-2">Hot</span>
          )}
          {discount && (
            <span className="badge-discount absolute top-2 right-2">-{discount}%</span>
          )}
        </div>
      </Link>

      <CardContent className="p-4">
        <div className="space-y-2">
          <Badge variant="outline" className="bg-gray-100 text-gray-800">
            {category}
          </Badge>
          
          <Link to={`/product/${id}`}>
            <h3 className="font-medium line-clamp-2 hover:text-marketplace-primary transition-colors">
              {title}
            </h3>
          </Link>

          <div className="flex items-center gap-1">
            {Array(5).fill(0).map((_, i) => (
              <Star 
                key={i}
                className={`h-4 w-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
              />
            ))}
            <span className="text-xs text-gray-500">({reviews})</span>
          </div>

          <div className="flex items-center gap-1 text-sm">
            <span className="text-gray-500">Người bán:</span>
            <span className="font-medium flex items-center">
              {seller.name}
              {seller.verified && (
                <span className="ml-1 text-xs bg-blue-100 text-blue-700 px-1 rounded">✓</span>
              )}
            </span>
          </div>

          <div className="text-sm text-gray-500">
            Còn lại: {inStock}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <div className="font-bold text-lg">
          {formatPrice(price.min)} {price.max > price.min && `- ${formatPrice(price.max)}`}
        </div>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
