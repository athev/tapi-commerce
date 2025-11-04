
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Shield, Store, Clock, TrendingUp, CheckCircle } from "lucide-react";
import ChatButton from "@/components/chat/ChatButton";
import { cn } from "@/lib/utils";

interface SellerInfoProps {
  sellerId: string;
  sellerName: string;
  sellerRating?: number;
  totalSales?: number;
  joinDate?: string;
  responseTime?: string;
  verified?: boolean;
  productId?: string;
  productTitle?: string;
  isOnline?: boolean;
  responseRate?: number;
  totalProducts?: number;
}

const SellerInfo = ({ 
  sellerId, 
  sellerName, 
  sellerRating = 4.8, 
  totalSales = 1250,
  joinDate = "2022-03-15",
  responseTime = "< 1 giờ",
  verified = true,
  productId,
  productTitle,
  isOnline = true,
  responseRate = 98,
  totalProducts = 50
}: SellerInfoProps) => {
  
  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${month}/${year}`;
  };

  // Create product object for ChatButton
  const product = {
    id: productId || '',
    title: productTitle || '',
    seller_id: sellerId,
    seller_name: sellerName,
    price: 0,
    image: undefined
  };

  const getResponseRateColor = (rate: number) => {
    if (rate >= 90) return "text-green-600";
    if (rate >= 80) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <Card>
      <CardHeader className="p-4 pb-3">
        <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
          <Store className="h-4 w-4 sm:h-5 sm:w-5" />
          <span>Thông tin người bán</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {/* Seller Basic Info with Online Status */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-marketplace-primary rounded-full flex items-center justify-center text-white font-semibold text-sm sm:text-lg">
              {sellerName.charAt(0).toUpperCase()}
            </div>
            {isOnline && (
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
              <h3 className="font-semibold text-sm sm:text-base truncate">{sellerName}</h3>
              {isOnline && (
                <Badge className="bg-green-500/10 text-green-700 border-green-200 text-[10px] px-1.5 py-0.5">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1 animate-pulse" />
                  Online
                </Badge>
              )}
              {verified && (
                <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-[10px] px-1.5 py-0.5 flex items-center gap-1">
                  <Shield className="h-2.5 w-2.5" />
                  Đã xác thực
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
              <div className="flex items-center">
                <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400 mr-1" />
                <span className="font-semibold">{sellerRating}</span>
              </div>
              <span>•</span>
              <span>{totalSales.toLocaleString()} đã bán</span>
            </div>
          </div>
        </div>

        {/* Enhanced Seller Stats Grid */}
        <div className="grid grid-cols-2 gap-2 p-2.5 bg-gray-50 rounded-lg">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              <span>Sản phẩm</span>
            </div>
            <p className="text-sm font-semibold">{totalProducts}+</p>
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <CheckCircle className="h-3 w-3" />
              <span>Tỷ lệ phản hồi</span>
            </div>
            <p className={cn("text-sm font-semibold", getResponseRateColor(responseRate))}>
              {responseRate}%
            </p>
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Thời gian phản hồi</span>
            </div>
            <p className="text-sm font-semibold">{responseTime}</p>
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Star className="h-3 w-3" />
              <span>Tham gia</span>
            </div>
            <p className="text-sm font-semibold">{formatJoinDate(joinDate)}</p>
          </div>
        </div>

        {/* Action Buttons - Compact */}
        <div className="flex gap-2">
          {productId && (
            <ChatButton
              product={product}
              variant="outline"
              className="flex-1 h-9 text-xs sm:text-sm"
            />
          )}
          <Button variant="outline" className="flex-1 h-9 text-xs sm:text-sm">
            <Store className="h-4 w-4 mr-1" />
            <span className="truncate">Cửa hàng</span>
          </Button>
        </div>

        {/* Seller Policies - Hidden on mobile */}
        <div className="text-xs text-gray-500 space-y-1 hidden sm:block">
          <p>• Hỗ trợ 24/7 qua chat</p>
          <p>• Đảm bảo hoàn tiền nếu sản phẩm lỗi</p>
          <p>• Giao hàng ngay sau khi thanh toán</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SellerInfo;
