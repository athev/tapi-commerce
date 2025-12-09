import { Star, Package, MessageCircle, Clock, Users, CalendarDays } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

interface ShopStatsBarProps {
  seller: {
    seller_rating?: number;
    response_rate?: number;
    response_time?: string;
    created_at: string;
  };
  productsCount: number;
  followersCount?: number;
  reviewsCount?: number;
}

const ShopStatsBar = ({ 
  seller, 
  productsCount, 
  followersCount = 0,
  reviewsCount = 0 
}: ShopStatsBarProps) => {
  
  const formatJoinDate = (date: string) => {
    const joinDate = new Date(date);
    const now = new Date();
    const diffYears = now.getFullYear() - joinDate.getFullYear();
    const diffMonths = (now.getFullYear() - joinDate.getFullYear()) * 12 + 
                       (now.getMonth() - joinDate.getMonth());
    
    if (diffYears >= 1) {
      return `${diffYears} năm`;
    } else if (diffMonths >= 1) {
      return `${diffMonths} tháng`;
    } else {
      return "Mới tham gia";
    }
  };

  const formatFollowers = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  const stats = [
    {
      icon: Star,
      label: "Đánh giá",
      value: seller.seller_rating?.toFixed(1) || "5.0",
      subValue: reviewsCount > 0 ? `(${reviewsCount})` : "",
      iconColor: "text-yellow-500",
      iconFill: "fill-yellow-500"
    },
    {
      icon: Package,
      label: "Sản phẩm",
      value: productsCount.toString(),
      iconColor: "text-primary"
    },
    {
      icon: MessageCircle,
      label: "Tỷ lệ phản hồi",
      value: `${seller.response_rate || 95}%`,
      iconColor: "text-green-500"
    },
    {
      icon: Clock,
      label: "Thời gian phản hồi",
      value: seller.response_time || "< 1 giờ",
      iconColor: "text-blue-500"
    },
    {
      icon: Users,
      label: "Người theo dõi",
      value: formatFollowers(followersCount),
      iconColor: "text-purple-500"
    },
    {
      icon: CalendarDays,
      label: "Tham gia",
      value: formatJoinDate(seller.created_at),
      iconColor: "text-orange-500"
    }
  ];

  return (
    <div className="mx-4 md:mx-8 mt-4">
      <div className="bg-card rounded-lg border shadow-sm">
        <div className="grid grid-cols-3 md:grid-cols-6 divide-x divide-y md:divide-y-0 divide-border">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="flex flex-col items-center justify-center p-3 md:p-4 hover:bg-muted/50 transition-colors"
            >
              <stat.icon 
                className={`h-5 w-5 md:h-6 md:w-6 mb-1.5 ${stat.iconColor} ${stat.iconFill || ''}`} 
              />
              <div className="flex items-baseline gap-1">
                <span className="text-base md:text-lg font-bold text-foreground">
                  {stat.value}
                </span>
                {stat.subValue && (
                  <span className="text-xs text-muted-foreground">
                    {stat.subValue}
                  </span>
                )}
              </div>
              <span className="text-[10px] md:text-xs text-muted-foreground text-center">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShopStatsBar;
