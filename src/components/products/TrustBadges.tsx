import { Badge } from "@/components/ui/badge";
import { Shield, Zap, RotateCcw, Headphones } from "lucide-react";

const TrustBadges = () => {
  return (
    <div className="flex flex-wrap gap-2 py-3 border-y">
      <Badge variant="outline" className="gap-1 bg-green-50 border-green-200 text-green-700">
        <Zap className="h-3.5 w-3.5" />
        <span className="text-xs">Giao ngay lập tức</span>
      </Badge>
      <Badge variant="outline" className="gap-1 bg-blue-50 border-blue-200 text-blue-700">
        <RotateCcw className="h-3.5 w-3.5" />
        <span className="text-xs">Hoàn tiền nếu lỗi</span>
      </Badge>
      <Badge variant="outline" className="gap-1 bg-purple-50 border-purple-200 text-purple-700">
        <Headphones className="h-3.5 w-3.5" />
        <span className="text-xs">Hỗ trợ 24/7</span>
      </Badge>
      <Badge variant="outline" className="gap-1 bg-amber-50 border-amber-200 text-amber-700">
        <Shield className="h-3.5 w-3.5" />
        <span className="text-xs">Bảo mật 100%</span>
      </Badge>
    </div>
  );
};

export default TrustBadges;
