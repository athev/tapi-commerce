import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Users, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";

interface UrgencyIndicatorsProps {
  stock?: number;
  showViewers?: boolean;
  showRecentPurchase?: boolean;
}

const UrgencyIndicators = ({ 
  stock = 999, 
  showViewers = true, 
  showRecentPurchase = true 
}: UrgencyIndicatorsProps) => {
  const [viewerCount, setViewerCount] = useState(12);

  useEffect(() => {
    if (!showViewers) return;
    
    const interval = setInterval(() => {
      setViewerCount(prev => {
        const change = Math.random() > 0.5 ? 1 : -1;
        const newCount = prev + change;
        return Math.max(8, Math.min(25, newCount));
      });
    }, 5000);
    
    return () => clearInterval(interval);
  }, [showViewers]);

  const recentBuyers = [
    "Nguyễn Văn A",
    "Trần Thị B",
    "Lê Minh C",
    "Phạm Thu D"
  ];

  const randomBuyer = recentBuyers[Math.floor(Math.random() * recentBuyers.length)];

  return (
    <div className="space-y-3">
      {/* Low stock warning */}
      {stock < 10 && (
        <Alert variant="destructive" className="bg-orange-50 border-orange-300">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            ⚠️ <strong>Chỉ còn {stock} sản phẩm!</strong> Đặt hàng ngay để không bỏ lỡ.
          </AlertDescription>
        </Alert>
      )}

      {/* Viewers count */}
      {showViewers && (
        <div className="flex items-center gap-2 text-sm bg-blue-50 p-3 rounded-lg border border-blue-200">
          <span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <Users className="h-4 w-4 text-blue-600" />
          <span className="text-blue-800">
            🔥 <strong>{viewerCount}</strong> người đang xem sản phẩm này
          </span>
        </div>
      )}

      {/* Recent purchase */}
      {showRecentPurchase && (
        <div className="flex items-center gap-2 text-sm bg-green-50 p-3 rounded-lg border border-green-200">
          <ShoppingBag className="h-4 w-4 text-green-600" />
          <span className="text-green-800">
            <strong>{randomBuyer}</strong> vừa mua sản phẩm này <span className="text-green-600">2 phút trước</span>
          </span>
        </div>
      )}
    </div>
  );
};

export default UrgencyIndicators;
