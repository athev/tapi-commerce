
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Shield, MessageCircle, Store, Calendar, Award } from "lucide-react";

interface SellerInfoProps {
  sellerId: string;
  sellerName: string;
  sellerRating?: number;
  totalSales?: number;
  joinDate?: string;
  responseTime?: string;
  verified?: boolean;
}

const SellerInfo = ({ 
  sellerId, 
  sellerName, 
  sellerRating = 4.8, 
  totalSales = 1250,
  joinDate = "2022-03-15",
  responseTime = "Trong vòng 2 giờ",
  verified = true 
}: SellerInfoProps) => {
  
  const formatJoinDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Store className="h-5 w-5" />
          <span>Thông tin người bán</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Seller Basic Info */}
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-marketplace-primary rounded-full flex items-center justify-center text-white font-semibold text-lg">
            {sellerName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold">{sellerName}</h3>
              {verified && (
                <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                  <Shield className="h-3 w-3 mr-1" />
                  Đã xác minh
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <div className="flex items-center">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                <span>{sellerRating}</span>
              </div>
              <span>•</span>
              <span>{totalSales.toLocaleString()} lượt bán</span>
            </div>
          </div>
        </div>

        {/* Seller Stats */}
        <div className="grid grid-cols-1 gap-3 pt-4 border-t">
          <div className="flex items-center space-x-3 text-sm">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600">Tham gia từ {formatJoinDate(joinDate)}</span>
          </div>
          
          <div className="flex items-center space-x-3 text-sm">
            <MessageCircle className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600">Phản hồi: {responseTime}</span>
          </div>
          
          <div className="flex items-center space-x-3 text-sm">
            <Award className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600">Người bán uy tín</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-4 border-t">
          <Button variant="outline" className="w-full">
            <MessageCircle className="h-4 w-4 mr-2" />
            Liên hệ người bán
          </Button>
          <Button variant="ghost" className="w-full text-marketplace-primary hover:text-marketplace-primary/80">
            <Store className="h-4 w-4 mr-2" />
            Xem cửa hàng
          </Button>
        </div>

        {/* Seller Policies */}
        <div className="text-xs text-gray-500 pt-4 border-t space-y-1">
          <p>• Hỗ trợ 24/7 qua chat</p>
          <p>• Đảm bảo hoàn tiền nếu sản phẩm lỗi</p>
          <p>• Giao hàng ngay sau khi thanh toán</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SellerInfo;
