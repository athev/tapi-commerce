import { Card } from "@/components/ui/card";
import { Coins, Ticket, Headphones, Heart, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileUtilitiesSectionProps {
  piBalance: number;
  ticketCount: number;
  favoriteCount: number;
  onPIWallet: () => void;
  onServices: () => void;
  onFavorites: () => void;
  onVouchers: () => void;
}

const MobileUtilitiesSection = ({
  piBalance,
  ticketCount,
  favoriteCount,
  onPIWallet,
  onServices,
  onFavorites,
  onVouchers,
}: MobileUtilitiesSectionProps) => {
  const utilities = [
    {
      icon: Coins,
      title: 'Ví PI',
      subtitle: `${piBalance} PI`,
      color: 'text-yellow-500 bg-yellow-50',
      onClick: onPIWallet,
    },
    {
      icon: Ticket,
      title: 'Kho Voucher',
      subtitle: 'Xem voucher',
      color: 'text-orange-500 bg-orange-50',
      onClick: onVouchers,
    },
    {
      icon: Headphones,
      title: 'Yêu cầu dịch vụ',
      subtitle: `${ticketCount} yêu cầu`,
      color: 'text-blue-500 bg-blue-50',
      onClick: onServices,
    },
    {
      icon: Heart,
      title: 'Yêu thích',
      subtitle: `${favoriteCount} sản phẩm`,
      color: 'text-pink-500 bg-pink-50',
      onClick: onFavorites,
    },
  ];

  return (
    <div className="p-4">
      <h3 className="font-semibold mb-3">Tiện ích của tôi</h3>
      <div className="grid grid-cols-2 gap-3">
        {utilities.map(({ icon: Icon, title, subtitle, color, onClick }) => (
          <Card
            key={title}
            className="p-4 cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98]"
            onClick={onClick}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={cn("p-2 rounded-lg", color.split(' ')[1])}>
                  <Icon className={cn("h-5 w-5", color.split(' ')[0])} />
                </div>
                <div>
                  <p className="font-medium text-sm">{title}</p>
                  <p className="text-xs text-muted-foreground">{subtitle}</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MobileUtilitiesSection;
