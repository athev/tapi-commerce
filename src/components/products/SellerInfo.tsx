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
  return <div className="flex items-center justify-between gap-4">
      {/* Left: Avatar + Info */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="relative shrink-0">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-semibold text-lg">
            {sellerName.charAt(0).toUpperCase()}
          </div>
          {isOnline && <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm flex items-center gap-1.5 mb-0.5">
            <span className="truncate">{sellerName}</span>
            {verified && (
              <Badge className="h-4 px-1.5 text-[10px] bg-blue-500 hover:bg-blue-500 shrink-0">
                ✓
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
            <span className="flex items-center gap-0.5">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              {sellerRating || 4.8}
            </span>
            <span>•</span>
            <span>💬 {responseRate || 98}%</span>
            <span>•</span>
            <span className={cn(
              "font-medium",
              (totalSales >= 1000) ? "text-green-600" : "text-foreground"
            )}>
              {totalSales?.toLocaleString() || 0} bán
            </span>
          </div>
        </div>
      </div>
      
      {/* Right: Action buttons */}
      <div className="flex gap-2 shrink-0">
        {productId && <ChatButton product={{
          id: productId || '',
          title: productTitle || '',
          seller_id: sellerId,
          seller_name: sellerName,
          price: 0,
          image: undefined
        }} size="sm" />}
        <Button variant="ghost" size="sm" className="h-9">
          <Store className="h-4 w-4 mr-1" />
          Shop
        </Button>
      </div>
    </div>;
};
export default SellerInfo;