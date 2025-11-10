
import { Button } from "@/components/ui/button";
import { WifiOff, ShoppingCart, Chrome, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

interface RegisterUserFormSubmitProps {
  isLoading: boolean;
  isGoogleLoading: boolean;
  networkError: boolean;
  onGoogleSignIn: () => void;
}

const RegisterUserFormSubmit = ({ isLoading, isGoogleLoading, networkError, onGoogleSignIn }: RegisterUserFormSubmitProps) => {
  return (
    <>
      <Button 
        type="submit" 
        className="w-full bg-blue-600 hover:bg-blue-700"
        disabled={isLoading || networkError || isGoogleLoading}
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

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Hoặc tiếp tục với
          </span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={onGoogleSignIn}
        disabled={isGoogleLoading || isLoading || networkError}
      >
        {isGoogleLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Đang xử lý...
          </>
        ) : (
          <>
            <Chrome className="mr-2 h-4 w-4" />
            Tiếp tục với Google
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
