
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Star, Heart, Share2, Flag, Shield, Award, Zap } from "lucide-react";
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

const getShortDescription = (type: string) => {
  const descriptions = {
    file_download: 'Tải về ngay lập tức sau khi thanh toán - Chất lượng cao, bảo mật',
    license_key_delivery: 'Mã kích hoạt chính hãng - Giao ngay trong 5 phút',
    shared_account: 'Tài khoản premium chia sẻ - Truy cập đầy đủ tính năng',
    upgrade_account_no_pass: 'Nâng cấp tài khoản hiện tại - Không đổi mật khẩu',
    upgrade_account_with_pass: 'Nâng cấp tài khoản - Bảo mật cao với mật khẩu mới'
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
    <div className="space-y-4">
      {/* Category Badge */}
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-sm px-3 py-1">
          {getProductTypeLabel(productType)}
        </Badge>
        
        {/* Action Buttons */}
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFavorited(!isFavorited)}
            className={`h-8 w-8 p-0 ${isFavorited ? "text-red-500" : "text-gray-500"}`}
          >
            <Heart className={`h-4 w-4 ${isFavorited ? "fill-current" : ""}`} />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleShare} className="h-8 w-8 p-0 text-gray-500">
            <Share2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-500">
            <Flag className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Product Title */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 leading-tight mb-2">
          {title}
        </h1>
        
        {/* Short Description */}
        <p className="text-gray-600 text-sm lg:text-base mb-3">
          {getShortDescription(productType)}
        </p>
        
        {/* Category */}
        <div className="text-sm text-gray-500">
          <span>Danh mục: </span>
          <span className="font-medium text-gray-700">{category}</span>
        </div>
      </div>

      {/* Rating and Social Proof */}
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <div className="flex items-center space-x-2">
          <div className="flex">
            {Array(5).fill(0).map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <span className="font-medium">{rating}</span>
          <span className="text-gray-500">({reviews} đánh giá)</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <span className="text-green-600 font-semibold">{purchases} đã bán</span>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-green-600 font-medium">{inStock} còn lại</span>
          </div>
        </div>
      </div>

      {/* Price Section */}
      <div className="bg-gray-50 p-4 rounded-lg border">
        <div className="flex items-baseline space-x-3 mb-1">
          <div className="text-3xl lg:text-4xl font-bold text-marketplace-primary">
            {formatPrice(price)}
          </div>
          {purchases > 50 && (
            <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-xs">
              Bán chạy
            </Badge>
          )}
        </div>
        <div className="text-sm text-gray-500">
          Giá đã bao gồm VAT • Thanh toán an toàn
        </div>
      </div>

      {/* Key Benefits */}
      <div className="bg-white border rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-3 text-sm">Điểm nổi bật:</h3>
        <div className="grid grid-cols-1 gap-2 text-sm">
          <div className="flex items-center space-x-3">
            <Shield className="h-4 w-4 text-green-600 flex-shrink-0" />
            <span className="text-gray-700">Bảo mật thông tin 100%</span>
          </div>
          <div className="flex items-center space-x-3">
            <Zap className="h-4 w-4 text-blue-600 flex-shrink-0" />
            <span className="text-gray-700">Giao hàng ngay lập tức</span>
          </div>
          <div className="flex items-center space-x-3">
            <Award className="h-4 w-4 text-orange-600 flex-shrink-0" />
            <span className="text-gray-700">Hoàn tiền nếu không hài lòng</span>
          </div>
        </div>
      </div>

      {/* Seller Info */}
      <Card className="bg-gray-50 border-gray-200">
        <div className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-marketplace-primary rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {sellerName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-semibold text-sm truncate">{sellerName}</h3>
                {sellerVerified && (
                  <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs px-2 py-0.5">
                    <Shield className="h-3 w-3 mr-1" />
                    Đã xác minh
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-600">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span>4.9 • Phản hồi nhanh • Online</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ProductHeader;
