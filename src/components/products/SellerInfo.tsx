
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Shield, MessageCircle, Store, Calendar, Award } from "lucide-react";
import ChatButton from "@/components/chat/ChatButton";

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
}

const SellerInfo = ({ 
  sellerId, 
  sellerName, 
  sellerRating = 4.8, 
  totalSales = 1250,
  joinDate = "2022-03-15",
  responseTime = "Trong vòng 2 giờ",
  verified = true,
  productId,
  productTitle
}: SellerInfoProps) => {
  
  const formatJoinDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', { 
      year: 'numeric', 
      month: 'long' 
    });
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Store className="h-5 w-5" />
          <span>Thông tin người bán</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
        {/* Seller Basic Info - Compact */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-marketplace-primary rounded-full flex items-center justify-center text-white font-semibold text-sm sm:text-lg">
            {sellerName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="font-semibold text-sm sm:text-base truncate">{sellerName}</h3>
              {verified && (
                <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs px-1.5 py-0">
                  <Shield className="h-3 w-3" />
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
              <div className="flex items-center">
                <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400 mr-1" />
                <span>{sellerRating}</span>
              </div>
              <span>•</span>
              <span>{totalSales.toLocaleString()} bán</span>
            </div>
          </div>
        </div>

        {/* Seller Stats - Compact on mobile */}
        <div className="flex items-center justify-between text-xs text-gray-600 pt-2 border-t">
          <span>Tham gia {formatJoinDate(joinDate)}</span>
          <span>•</span>
          <span>Phản hồi {responseTime}</span>
        </div>

        {/* Action Buttons - Compact */}
        <div className="flex gap-2 pt-2">
          {productId && (
            <ChatButton
              product={product}
              variant="outline"
              className="flex-1 h-9 text-sm"
            />
          )}
          <Button variant="outline" className="flex-1 h-9 text-sm">
            <Store className="h-4 w-4 mr-1" />
            Cửa hàng
          </Button>
        </div>

        {/* Seller Policies - Hidden on mobile */}
        <div className="text-xs text-gray-500 pt-3 border-t space-y-1 hidden sm:block">
          <p>• Hỗ trợ 24/7 qua chat</p>
          <p>• Đảm bảo hoàn tiền nếu sản phẩm lỗi</p>
          <p>• Giao hàng ngay sau khi thanh toán</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SellerInfo;
