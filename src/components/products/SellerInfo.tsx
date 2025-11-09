import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Shield, Store, Clock, TrendingUp, CheckCircle } from "lucide-react";
import ChatButton from "@/components/chat/ChatButton";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
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
  const navigate = useNavigate();
  const [sellerProfile, setSellerProfile] = useState<any>(null);
  
  useEffect(() => {
    const fetchSellerProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('full_name, avatar, shop_description, phone, address, seller_rating, response_rate, response_time, is_online, total_products, created_at, slug')
        .eq('id', sellerId)
        .single();
      
      if (data) {
        setSellerProfile(data);
      }
    };
    
    if (sellerId) {
      fetchSellerProfile();
    }
  }, [sellerId]);

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
    seller_name: sellerProfile?.full_name || sellerName,
    price: 0,
    image: undefined
  };
  
  const getResponseRateColor = (rate: number) => {
    if (rate >= 90) return "text-green-600";
    if (rate >= 80) return "text-yellow-600";
    return "text-red-600";
  };
  
  const displayName = sellerProfile?.full_name || sellerName;
  const displayAvatar = sellerProfile?.avatar;
  const displayRating = sellerProfile?.seller_rating || sellerRating;
  const displayResponseTime = sellerProfile?.response_time || responseTime;
  const displayResponseRate = sellerProfile?.response_rate || responseRate;
  const displayTotalProducts = sellerProfile?.total_products || totalProducts;
  const displayIsOnline = sellerProfile?.is_online ?? isOnline;
  const displayJoinDate = sellerProfile?.created_at || joinDate;
  return <div className="space-y-4">
      {/* Seller Basic Info with Online Status */}
      <div className="flex items-center space-x-3 pb-3 border-b">
        <div className="relative">
          <Avatar className="w-12 h-12 sm:w-14 sm:h-14">
            <AvatarImage src={displayAvatar} alt={displayName} />
            <AvatarFallback className="bg-primary text-white font-semibold text-lg sm:text-xl">
              {displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {displayIsOnline && <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="font-bold text-base sm:text-lg truncate">{displayName}</h3>
            {displayIsOnline && <Badge className="bg-green-500/10 text-green-700 border-green-200 text-[10px] px-1.5 py-0.5">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1 animate-pulse" />
                Online
              </Badge>}
            {verified && <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] px-1.5 py-0.5 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Đã xác thực
              </Badge>}
          </div>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
              <span className="font-semibold text-foreground">{displayRating}</span>
            </div>
            <span>|</span>
            <span>{totalSales.toLocaleString()} đã bán</span>
          </div>
        </div>
      </div>

      {/* Stats Section - Vertical List */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1">
          <TrendingUp className="h-3 w-3" />
          Thống kê người bán
        </h4>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between py-1.5">
            <span className="text-muted-foreground">Sản phẩm:</span>
            <span className="font-semibold">{displayTotalProducts}+</span>
          </div>
          
          <div className="flex items-center justify-between py-1.5">
            <span className="text-muted-foreground">Tỷ lệ phản hồi:</span>
            <span className={cn("font-semibold flex items-center gap-1", getResponseRateColor(displayResponseRate))}>
              {displayResponseRate}% {displayResponseRate >= 90 && <CheckCircle className="h-3.5 w-3.5" />}
            </span>
          </div>
          
          <div className="flex items-center justify-between py-1.5">
            <span className="text-muted-foreground">T.gian phản hồi:</span>
            <span className="font-semibold">{displayResponseTime}</span>
          </div>
          
          <div className="flex items-center justify-between py-1.5">
            <span className="text-muted-foreground">Tham gia:</span>
            <span className="font-semibold">{formatJoinDate(displayJoinDate)}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-2 px-0 mx-0 py-[6px]">
        {productId && <ChatButton product={product} variant="outline" className="flex-1 h-10" />}
        <Button 
          variant="outline" 
          className="flex-1 h-10 py-0 text-sm px-0"
          onClick={() => navigate(`/shop/${sellerProfile?.slug || sellerId}`)}
        >
          <Store className="h-4 w-4 mr-2" />
          Xem cửa hàng
        </Button>
      </div>

      {/* Seller Policies */}
      <div className="space-y-1.5 pt-3 border-t">
        <div className="flex items-start gap-2 text-xs text-muted-foreground">
          <CheckCircle className="h-3.5 w-3.5 text-green-600 mt-0.5 flex-shrink-0" />
          <span>Hỗ trợ 24/7 qua chat</span>
        </div>
        <div className="flex items-start gap-2 text-xs text-muted-foreground">
          <CheckCircle className="h-3.5 w-3.5 text-green-600 mt-0.5 flex-shrink-0" />
          <span>Hoàn tiền nếu sản phẩm lỗi</span>
        </div>
        <div className="flex items-start gap-2 text-xs text-muted-foreground">
          <CheckCircle className="h-3.5 w-3.5 text-green-600 mt-0.5 flex-shrink-0" />
          <span>Giao hàng ngay sau thanh toán</span>
        </div>
      </div>
    </div>;
};
export default SellerInfo;