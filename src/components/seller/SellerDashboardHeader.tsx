import { Button } from "@/components/ui/button";
import { Store } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const SellerDashboardHeader = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="mb-8 flex justify-between items-start">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard Người bán</h1>
        <p className="text-gray-600">Quản lý sản phẩm và đơn hàng của bạn</p>
      </div>
      <Button 
        variant="outline" 
        onClick={() => navigate(`/shop/${user?.id}`)}
      >
        <Store className="h-4 w-4 mr-2" />
        Xem gian hàng
      </Button>
    </div>
  );
};

export default SellerDashboardHeader;
