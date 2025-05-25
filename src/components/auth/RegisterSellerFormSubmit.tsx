
import { Button } from "@/components/ui/button";
import { WifiOff, Store } from "lucide-react";
import { Link } from "react-router-dom";

interface RegisterSellerFormSubmitProps {
  isLoading: boolean;
  networkError: boolean;
}

const RegisterSellerFormSubmit = ({ isLoading, networkError }: RegisterSellerFormSubmitProps) => {
  return (
    <>
      <Button 
        type="submit" 
        className="w-full bg-green-600 hover:bg-green-700"
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
            <Store className="mr-2 h-4 w-4" />
            Đăng ký làm người bán
          </>
        )}
      </Button>
      
      <div className="mt-6 text-center text-sm space-y-2">
        <div>
          Chỉ muốn mua hàng?{" "}
          <Link to="/register-user" className="text-blue-600 hover:underline">
            Đăng ký làm người mua
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

export default RegisterSellerFormSubmit;
