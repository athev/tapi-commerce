import { MapPin, Phone, Clock, CalendarDays, MessageCircle } from "lucide-react";

interface ShopProfileTabProps {
  seller: {
    full_name: string;
    shop_description?: string;
    address?: string;
    phone?: string;
    response_time?: string;
    created_at: string;
  };
}

const ShopProfileTab = ({ seller }: ShopProfileTabProps) => {
  
  const formatJoinDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString('vi-VN', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  const infoItems = [
    {
      icon: MapPin,
      label: "Địa chỉ",
      value: seller.address || "Chưa cập nhật"
    },
    {
      icon: Phone,
      label: "Số điện thoại",
      value: seller.phone || "Chưa cập nhật"
    },
    {
      icon: Clock,
      label: "Thời gian phản hồi",
      value: seller.response_time || "Trong vài phút"
    },
    {
      icon: CalendarDays,
      label: "Tham gia",
      value: formatJoinDate(seller.created_at)
    }
  ];

  return (
    <div className="bg-card">
      {/* Shop Description */}
      {seller.shop_description && (
        <div className="px-4 py-3 border-b">
          <h3 className="text-sm font-medium text-foreground mb-2">Giới thiệu</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {seller.shop_description}
          </p>
        </div>
      )}

      {/* Info Items */}
      <div className="divide-y divide-border">
        {infoItems.map((item, index) => (
          <div key={index} className="px-4 py-3 flex items-center gap-3">
            <item.icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className="text-sm text-foreground truncate">{item.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShopProfileTab;
