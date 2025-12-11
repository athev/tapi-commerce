import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Store, MessageCircle, UserPlus, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
interface ShopHeaderProps {
  seller: {
    id: string;
    full_name: string;
    avatar?: string;
    shop_banner?: string;
    slug?: string;
    seller_rating?: number;
  };
  followersCount?: number;
}
const ShopHeader = ({
  seller,
  followersCount = 0
}: ShopHeaderProps) => {
  const navigate = useNavigate();
  const formatFollowers = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };
  return <div className="relative">
      {/* Banner Section - Shorter height */}
      <div className="relative w-full h-24 md:h-32 overflow-hidden">
        {seller.shop_banner ? <img src={seller.shop_banner} alt={`${seller.full_name} banner`} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gradient-to-r from-primary via-primary/80 to-primary/60" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      </div>

      {/* Shop Info - Compact layout */}
      <div className="bg-card border-b">
        <div className="px-4 py-[7px]">
          <div className="flex items-start gap-3">
            {/* Avatar with Badge */}
            <div className="relative flex-shrink-0 -mt-8">
              <Avatar className="h-16 w-16 border-2 border-background shadow-md">
                <AvatarImage src={seller.avatar} alt={seller.full_name} />
                <AvatarFallback className="bg-primary/10">
                  <Store className="h-6 w-6 text-primary" />
                </AvatarFallback>
              </Avatar>
              {/* Yêu thích badge */}
              <Badge className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[9px] px-1.5 py-0 whitespace-nowrap">
                <Heart className="h-2.5 w-2.5 mr-0.5 fill-current" />
                Yêu thích
              </Badge>
            </div>

            {/* Shop Name & Stats */}
            <div className="flex-1 min-w-0 pt-1">
              <h1 className="text-base font-bold text-foreground truncate">
                {seller.full_name}
              </h1>
              <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                <span className="flex items-center gap-0.5">
                  <span className="text-yellow-500">★</span>
                  <span className="font-medium text-foreground">
                    {(seller.seller_rating || 5).toFixed(1)}
                  </span>
                </span>
                <span className="text-border">|</span>
                <span>{formatFollowers(followersCount)} Theo dõi</span>
              </div>
            </div>
          </div>

          {/* Action Buttons - Full width */}
          <div className="flex gap-2 mt-3">
            <Button variant="outline" size="sm" className="flex-1 h-9">
              <UserPlus className="h-4 w-4 mr-1.5" />
              Theo dõi
            </Button>
            
            <Button size="sm" onClick={() => navigate(`/chat?seller=${seller.slug || seller.id}`)} className="flex-1 h-9">
              <MessageCircle className="h-4 w-4 mr-1.5" />
              Chat
            </Button>
          </div>
        </div>
      </div>
    </div>;
};
export default ShopHeader;