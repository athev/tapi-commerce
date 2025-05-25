
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import SellerStatusHandler from "./SellerStatusHandler";

interface ProductFormAuthGuardProps {
  children: React.ReactNode;
}

const ProductFormAuthGuard = ({ children }: ProductFormAuthGuardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Bạn cần đăng nhập
            </h3>
            <p className="text-gray-500 mb-4">
              Vui lòng đăng nhập để tạo sản phẩm mới
            </p>
            <Button onClick={() => navigate('/login')}>
              Đăng nhập
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Use SellerStatusHandler to handle seller status checks
  return (
    <SellerStatusHandler>
      {children}
    </SellerStatusHandler>
  );
};

export default ProductFormAuthGuard;
