import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, RefreshCw, Zap, Clock } from "lucide-react";

const ProductTrustBadges = () => {
  return (
    <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
      <CardContent className="p-4 space-y-2">
        <div className="flex items-center gap-2 text-sm text-foreground">
          <ShieldCheck className="h-4 w-4 text-blue-600 flex-shrink-0" />
          <span>Thanh toán an toàn & bảo mật 100%</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-foreground">
          <Zap className="h-4 w-4 text-blue-600 flex-shrink-0" />
          <span>Giao hàng tự động ngay sau thanh toán</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-foreground">
          <RefreshCw className="h-4 w-4 text-blue-600 flex-shrink-0" />
          <span>Hỗ trợ đổi trả trong vòng 15 ngày</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-foreground">
          <Clock className="h-4 w-4 text-blue-600 flex-shrink-0" />
          <span>Hỗ trợ khách hàng 24/7</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductTrustBadges;
