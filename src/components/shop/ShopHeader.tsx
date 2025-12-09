import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Store, MessageCircle, UserPlus, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ShopHeaderProps {
  seller: {
    id: string;
    full_name: string;
    avatar?: string;
    shop_banner?: string;
    shop_description?: string;
    slug?: string;
    is_online?: boolean;
    created_at: string;
  };
  followersCount?: number;
}

const ShopHeader = ({ seller, followersCount = 0 }: ShopHeaderProps) => {
  const navigate = useNavigate();

  const formatFollowers = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  return (
    <div className="relative">
      {/* Banner Section */}
      <div className="relative w-full h-40 md:h-52 lg:h-64 overflow-hidden">
        {seller.shop_banner ? (
          <img
            src={seller.shop_banner}
            alt={`${seller.full_name} banner`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-primary via-primary/80 to-primary/60" />
        )}
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      </div>

      {/* Floating Shop Info Card */}
      <div className="relative mx-4 md:mx-8 -mt-16 md:-mt-20">
        <div className="bg-card rounded-xl shadow-xl border p-4 md:p-6">
          <div className="flex flex-col md:flex-row gap-4 md:gap-6">
            {/* Avatar with Online Badge */}
            <div className="relative flex-shrink-0 mx-auto md:mx-0">
              <Avatar className="h-20 w-20 md:h-28 md:w-28 border-4 border-background shadow-lg">
                <AvatarImage src={seller.avatar} alt={seller.full_name} />
                <AvatarFallback className="text-2xl md:text-3xl bg-primary/10">
                  <Store className="h-8 w-8 md:h-12 md:w-12 text-primary" />
                </AvatarFallback>
              </Avatar>
              {/* Online Status Indicator */}
              {seller.is_online && (
                <div className="absolute bottom-1 right-1 md:bottom-2 md:right-2">
                  <div className="w-4 h-4 md:w-5 md:h-5 bg-green-500 rounded-full border-2 border-background" />
                </div>
              )}
            </div>

            {/* Shop Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                <div>
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                    <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground">
                      {seller.full_name}
                    </h1>
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-0">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  </div>
                  
                  {seller.shop_description && (
                    <p className="text-sm md:text-base text-muted-foreground max-w-xl line-clamp-2">
                      {seller.shop_description}
                    </p>
                  )}
                  
                  {seller.is_online && (
                    <span className="inline-flex items-center gap-1.5 text-xs text-green-600 mt-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      Online
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-center md:justify-end gap-2 md:gap-3 mt-2 md:mt-0">
                  <Button 
                    variant="outline" 
                    className="flex-1 md:flex-none"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Theo dõi</span>
                    <span className="sm:hidden">Follow</span>
                    {followersCount > 0 && (
                      <Badge variant="secondary" className="ml-2 bg-muted">
                        {formatFollowers(followersCount)}
                      </Badge>
                    )}
                  </Button>
                  
                  <Button 
                    onClick={() => navigate(`/chat?seller=${seller.slug || seller.id}`)}
                    className="flex-1 md:flex-none"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Chat Ngay
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopHeader;
