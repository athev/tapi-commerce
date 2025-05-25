
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Heart, Share2, Flag, Shield, Award, Zap, TrendingUp, Clock } from "lucide-react";
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
    upgrade_account_no_pass: 'Nâng cấp tài khoản',
    upgrade_account_with_pass: 'Nâng cấp bảo mật'
  };
  return types[type as keyof typeof types] || type;
};

const getShortDescription = (type: string) => {
  const descriptions = {
    file_download: 'File chất lượng cao - Tải về ngay lập tức - Sử dụng vĩnh viễn',
    license_key_delivery: 'Mã kích hoạt chính hãng - Bảo hành đầy đủ - Hỗ trợ 24/7',
    shared_account: 'Tài khoản premium chia sẻ - Truy cập đầy đủ - An toàn bảo mật',
    upgrade_account_no_pass: 'Nâng cấp nhanh chóng - Giữ nguyên dữ liệu - Không đổi mật khẩu',
    upgrade_account_with_pass: 'Nâng cấp an toàn - Bảo mật tối đa - Quyền sở hữu hoàn toàn'
  };
  return descriptions[type as keyof typeof descriptions] || 'Sản phẩm chất lượng cao - Giao hàng nhanh chóng';
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
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Đã sao chép liên kết",
        description: "Liên kết sản phẩm đã được sao chép vào clipboard"
      });
    }
  };

  const urgencyHours = 12;
  const urgencyCount = Math.floor(Math.random() * 20) + 5;

  return (
    <div className="space-y-4">
      {/* Category and Quick Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sm">
          <span className="text-gray-500">Danh mục:</span>
          <Badge variant="outline" className="text-blue-600 border-blue-200">
            {category}
          </Badge>
        </div>
        
        <div className="flex items-center space-x-1">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsFavorited(!isFavorited)} 
            className={`h-8 w-8 p-0 ${isFavorited ? "text-red-500" : "text-gray-400"}`}
          >
            <Heart className={`h-4 w-4 ${isFavorited ? "fill-current" : ""}`} />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleShare} 
            className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
          >
            <Share2 className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
          >
            <Flag className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Product Title */}
      <div>
        <h1 className="text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 leading-tight mb-3">
          {title}
        </h1>
        
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Badge className="bg-blue-600 text-white">
            {getProductTypeLabel(productType)}
          </Badge>
          
          {purchases > 50 && (
            <Badge className="bg-orange-100 text-orange-700 border-orange-200">
              <TrendingUp className="h-3 w-3 mr-1" />
              Bán chạy
            </Badge>
          )}
          
          {inStock < 10 && inStock > 0 && (
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
              <Clock className="h-3 w-3 mr-1" />
              Sắp hết hàng
            </Badge>
          )}
        </div>
        
        <p className="text-gray-600 text-sm lg:text-base leading-relaxed">
          {getShortDescription(productType)}
        </p>
      </div>

      {/* Rating, Reviews & Social Proof */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="flex">
              {Array(5).fill(0).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="font-semibold text-gray-900">{rating}</span>
            <span className="text-gray-500">({reviews} đánh giá)</span>
          </div>
          
          <div className="flex items-center space-x-1 text-green-600">
            <span className="font-semibold">Đã bán {purchases}</span>
          </div>
        </div>

        {/* Urgency Elements */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
          <div className="flex items-center space-x-2 text-sm">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
            <span className="text-orange-700 font-medium">
              {urgencyCount} người đang xem sản phẩm này
            </span>
          </div>
          <div className="flex items-center space-x-2 text-sm mt-1">
            <Clock className="h-3 w-3 text-orange-600" />
            <span className="text-orange-600">
              Còn {urgencyHours}h để nhận ưu đãi đặc biệt
            </span>
          </div>
        </div>
      </div>

      {/* Price Section */}
      <div className="bg-gradient-to-r from-red-50 to-pink-50 p-4 rounded-xl border-2 border-red-100">
        <div className="flex items-baseline justify-between mb-2">
          <div className="space-y-1">
            <div className="text-2xl lg:text-3xl xl:text-4xl font-bold text-red-600">
              {formatPrice(price)}
            </div>
            <div className="text-sm text-gray-500 line-through">
              {formatPrice(Math.floor(price * 1.3))}
            </div>
          </div>
          
          <div className="text-right">
            <Badge className="bg-red-600 text-white mb-1">-23%</Badge>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-green-600 font-medium text-sm">
                Còn {inStock} sản phẩm
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Seller Info */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {sellerName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-gray-900">{sellerName}</span>
                {sellerVerified && (
                  <Badge className="bg-green-100 text-green-700 text-xs">
                    <Shield className="h-3 w-3 mr-1" />
                    Đã xác minh
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span>4.9 (2.1k đánh giá)</span>
                <span>•</span>
                <span>98% phản hồi</span>
              </div>
            </div>
          </div>
          
          <Badge className="bg-purple-100 text-purple-700">
            <Award className="h-3 w-3 mr-1" />
            Top Seller
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default ProductHeader;
