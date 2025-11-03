import { Truck, Gift, Shield, Phone } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface PolicyItem {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export const ShopPolicies = () => {
  const policies: PolicyItem[] = [
    {
      icon: <Truck className="h-6 w-6" />,
      title: "Miễn phí",
      description: "Trải nghiệm một số sản phẩm"
    },
    {
      icon: <Gift className="h-6 w-6" />,
      title: "Quà tặng",
      description: "Với hóa đơn trên 1 triệu"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Bảo hành",
      description: "Toàn bộ thời gian của gói đăng ký"
    },
    {
      icon: <Phone className="h-6 w-6" />,
      title: "Hotline: 0387.022.876",
      description: "Hỗ trợ 24/7"
    }
  ];

  return (
    <Card>
      <CardHeader className="bg-black text-white p-4 rounded-t-lg">
        <div className="flex items-center gap-2">
          <div className="bg-white rounded-full p-1">
            <Shield className="h-4 w-4 text-black" />
          </div>
          <h3 className="font-bold text-base">Chính sách Shop Tài Khoản</h3>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        {policies.map((policy, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className="text-gray-600 shrink-0">
              {policy.icon}
            </div>
            <div>
              <h4 className="font-semibold text-sm">{policy.title}</h4>
              <p className="text-xs text-gray-600">{policy.description}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
