
import { Button } from "@/components/ui/button";
import { WifiOff, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";

interface RegisterUserFormSubmitProps {
  isLoading: boolean;
  networkError: boolean;
}

const RegisterUserFormSubmit = ({ isLoading, networkError }: RegisterUserFormSubmitProps) => {
  return (
    <>
      <Button 
        type="submit" 
        className="w-full bg-blue-600 hover:bg-blue-700"
        disabled={isLoading || networkError}
      >
        {isLoading ? (
          <>
            <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></span>
            Đang xử lý...
          </>
        ) : networkError ? (
          <>
            <WifiOff className="mr-2 h-4 w-4" />
            Kiểm tra kết nối
          </>
        ) : (
          <>
            <ShoppingCart className="mr-2 h-4 w-4" />
            Đăng ký làm người mua
          </>
        )}
      </Button>
      
      <div className="mt-6 text-center text-sm space-y-2">
        <div>
          Muốn bán hàng thay vì mua?{" "}
          <Link to="/register-seller" className="text-green-600 hover:underline">
            Đăng ký làm người bán
          </Link>
        </div>
        <div>
          Đã có tài khoản?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Đăng nhập
          </Link>
        </div>
      </div>
    </>
  );
};

export default RegisterUserFormSubmit;
