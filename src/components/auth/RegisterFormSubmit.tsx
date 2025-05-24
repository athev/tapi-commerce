
import { Button } from "@/components/ui/button";
import { WifiOff } from "lucide-react";
import { Link } from "react-router-dom";

interface RegisterFormSubmitProps {
  isLoading: boolean;
  networkError: boolean;
}

const RegisterFormSubmit = ({ isLoading, networkError }: RegisterFormSubmitProps) => {
  return (
    <>
      <Button 
        type="submit" 
        className="w-full bg-marketplace-primary hover:bg-marketplace-primary/90"
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
          "Đăng ký"
        )}
      </Button>
      
      <div className="mt-6 text-center text-sm">
        Đã có tài khoản?{" "}
        <Link to="/login" className="text-blue-600 hover:underline">
          Đăng nhập
        </Link>
      </div>
    </>
  );
};

export default RegisterFormSubmit;
