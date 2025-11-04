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
  const [recentBuyer, setRecentBuyer] = useState("Nguyễn V***");
  const [timeSincePurchase, setTimeSincePurchase] = useState("2 phút trước");

  const recentBuyers = [
    "Nguyễn V***", "Trần T***", "Lê M***", "Phạm T***",
    "Hoàng A***", "Đỗ B***", "Vũ C***", "Bùi D***"
  ];

  const timeOptions = [
    "1 phút trước", "2 phút trước", "3 phút trước", 
    "5 phút trước", "7 phút trước", "10 phút trước"
  ];

  // Dynamic viewer count with occasional jumps
  useEffect(() => {
    if (!showViewers) return;
    
    const updateViewers = () => {
      setViewerCount(prev => {
        // 20% chance of "jump" (nhiều người vào cùng lúc)
        if (Math.random() > 0.8) {
          const jump = Math.floor(Math.random() * 5) + 2; // +2 to +6
          return Math.min(30, prev + jump);
        }
        
        // Normal fluctuation
        const change = Math.random() > 0.5 ? 1 : -1;
        const newCount = prev + change;
        return Math.max(10, Math.min(30, newCount));
      });
    };
    
    const interval = setInterval(updateViewers, Math.random() * 4000 + 3000); // 3-7s
    
    return () => clearInterval(interval);
  }, [showViewers]);

  // Dynamic recent purchase notification
  useEffect(() => {
    if (!showRecentPurchase) return;
    
    const interval = setInterval(() => {
      const randomBuyer = recentBuyers[Math.floor(Math.random() * recentBuyers.length)];
      const randomTime = timeOptions[Math.floor(Math.random() * timeOptions.length)];
      setRecentBuyer(randomBuyer);
      setTimeSincePurchase(randomTime);
    }, Math.random() * 7000 + 8000); // 8-15 seconds
    
    return () => clearInterval(interval);
  }, [showRecentPurchase]);

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
          <span className="text-green-800 transition-opacity duration-300">
            <strong>{recentBuyer}</strong> vừa mua sản phẩm này{" "}
            <span className="text-green-600">{timeSincePurchase}</span>
          </span>
        </div>
      )}
    </div>
  );
};

export default UrgencyIndicators;
