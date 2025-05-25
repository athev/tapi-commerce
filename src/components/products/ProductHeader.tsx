
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Heart, Share2, Flag, Shield, Award, Zap } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();

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

  return (
    <div className="space-y-4">
      {/* Category and Actions */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          <span>Danh mục: </span>
          <span className="font-medium text-gray-700">{category}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsFavorited(!isFavorited)} 
            className={`h-8 w-8 p-0 ${isFavorited ? "text-red-500" : "text-gray-500"}`}
          >
            <Heart className={`h-4 w-4 ${isFavorited ? "fill-current" : ""}`} />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleShare} 
            className="h-8 w-8 p-0 text-gray-500"
          >
            <Share2 className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0 text-gray-500"
          >
            <Flag className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Product Title */}
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900 leading-tight mb-3">
          {title}
        </h1>
        
        {/* Product Type Badge */}
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 mb-3">
          {getProductTypeLabel(productType)}
        </Badge>
        
        {/* Short Description */}
        <p className="text-gray-600 text-sm lg:text-base mb-4 leading-relaxed">
          {getShortDescription(productType)}
        </p>
      </div>

      {/* Rating and Social Proof */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-3 text-sm">
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
          <span className="text-green-600 font-semibold">Đã bán {purchases}</span>
        </div>
      </div>

      {/* Price and Stock Section */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 p-4 rounded-lg border border-red-200">
        <div className="flex items-baseline justify-between mb-2">
          <div className="text-2xl lg:text-3xl font-bold text-red-600">
            {formatPrice(price)}
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-green-600 font-medium text-sm">
              Còn {inStock} sản phẩm
            </span>
          </div>
        </div>
        
        {purchases > 50 && (
          <div className="flex items-center space-x-2">
            <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-xs">
              🔥 Bán chạy
            </Badge>
          </div>
        )}
      </div>

      {/* Key Benefits */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900 text-sm lg:text-base">Ưu điểm nổi bật:</h3>
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
    </div>
  );
};

export default ProductHeader;
