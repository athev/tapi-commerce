
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Star, Heart, Share2, Flag, Shield, Award } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ProductHeaderProps {
  title: string;
  price: number;
  category: string;
  productType: string;
  rating?: number;
  reviews?: number;
  purchases?: number;
  inStock?: number;
  sellerName: string;
  sellerVerified?: boolean;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', { 
    style: 'currency', 
    currency: 'VND',
    maximumFractionDigits: 0 
  }).format(price);
};

const getProductTypeLabel = (type: string) => {
  const types = {
    file_download: 'Tệp tải về',
    license_key_delivery: 'Mã kích hoạt',
    shared_account: 'Tài khoản dùng chung',
    upgrade_account_no_pass: 'Nâng cấp không cần mật khẩu',
    upgrade_account_with_pass: 'Nâng cấp có mật khẩu'
  };
  return types[type as keyof typeof types] || type;
};

const ProductHeader = ({ 
  title, 
  price, 
  category, 
  productType, 
  rating = 4.8, 
  reviews = 156, 
  purchases = 0,
  inStock = 0,
  sellerName,
  sellerVerified = true
}: ProductHeaderProps) => {
  const [isFavorited, setIsFavorited] = useState(false);
  const { toast } = useToast();

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: title,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Đã sao chép liên kết",
        description: "Liên kết sản phẩm đã được sao chép vào clipboard",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Title and Category */}
      <div>
        <Badge variant="outline" className="mb-3 bg-blue-50 text-blue-700 border-blue-200">
          {getProductTypeLabel(productType)}
        </Badge>
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight mb-2">
          {title}
        </h1>
        <div className="text-sm text-gray-600">
          <span>Danh mục: </span>
          <span className="font-medium">{category}</span>
        </div>
      </div>

      {/* Rating and Stats */}
      <div className="flex items-center space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="flex">
            {Array(5).fill(0).map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <span className="font-medium">{rating}</span>
          <span className="text-gray-500">({reviews} đánh giá)</span>
        </div>
        <span className="text-gray-300">|</span>
        <span className="text-gray-600">{purchases} đã bán</span>
        <span className="text-gray-300">|</span>
        <span className="text-green-600 font-medium">{inStock} còn lại</span>
      </div>

      {/* Price */}
      <div className="py-2">
        <div className="text-4xl font-bold text-marketplace-primary mb-1">
          {formatPrice(price)}
        </div>
        <div className="text-sm text-gray-500">
          Giá đã bao gồm VAT
        </div>
      </div>

      {/* Seller Info */}
      <Card className="p-4 bg-gray-50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-marketplace-primary rounded-full flex items-center justify-center text-white font-semibold">
            {sellerName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold">{sellerName}</h3>
              {sellerVerified && (
                <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs">
                  <Shield className="h-3 w-3 mr-1" />
                  Đã xác minh
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span>4.9 • Phản hồi nhanh</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Key Benefits */}
      <div className="space-y-2">
        <h3 className="font-semibold text-gray-900">Điểm nổi bật:</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center space-x-3">
            <Shield className="h-4 w-4 text-green-600" />
            <span>Bảo mật thông tin 100%</span>
          </div>
          <div className="flex items-center space-x-3">
            <Award className="h-4 w-4 text-blue-600" />
            <span>Giao hàng ngay lập tức</span>
          </div>
          <div className="flex items-center space-x-3">
            <Shield className="h-4 w-4 text-orange-600" />
            <span>Hoàn tiền nếu không hài lòng</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFavorited(!isFavorited)}
            className={isFavorited ? "text-red-500" : "text-gray-500"}
          >
            <Heart className={`h-4 w-4 ${isFavorited ? "fill-current" : ""}`} />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Flag className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductHeader;
