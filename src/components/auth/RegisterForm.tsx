
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import { WifiOff, RefreshCw } from "lucide-react";

interface RegisterFormProps {
  networkError: boolean;
  handleRetry: () => void;
}

const RegisterForm = ({ networkError, handleRetry }: RegisterFormProps) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const { toast: toastNotification } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate network connection first
    if (!navigator.onLine) {
      toast.error("Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet và thử lại sau.");
      return;
    }
    
    if (password !== confirmPassword) {
      toastNotification({
        title: "Lỗi",
        description: "Mật khẩu xác nhận không khớp.",
        variant: "destructive",
      });
      return;
    }
    
    if (!acceptTerms) {
      toastNotification({
        title: "Lỗi",
        description: "Vui lòng chấp nhận điều khoản sử dụng.",
        variant: "destructive",
      });
      return;
    }
    
    if (password.length < 6) {
      toastNotification({
        title: "Lỗi",
        description: "Mật khẩu phải có ít nhất 6 ký tự.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log("Starting signup attempt...");
      const { error, success } = await signUp(email, password, fullName);
      
      if (success && !error) {
        // Show success message with sonner toast for better visibility
        toast.success("Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản.");
        
        // Redirect after a short delay
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      } else if (error) {
        console.error("Signup error details:", error);
        
        if (error.code === "network_error" || error.message?.includes('network') || error.message?.includes('fetch')) {
          toast.error("Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet và thử lại sau.");
        } else {
          toast.error(error.message || "Có lỗi xảy ra khi đăng ký. Vui lòng thử lại sau.");
        }
      }
    } catch (error) {
      console.error("Registration error:", error);
      
      if (error.message?.includes('fetch') || error.message?.includes('network') || !navigator.onLine) {
        toast.error("Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet và thử lại sau.");
      } else {
        toast.error("Có lỗi xảy ra khi đăng ký. Vui lòng thử lại sau.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">Họ và tên</Label>
        <Input 
          id="fullName" 
          placeholder="Nguyễn Văn A" 
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          disabled={isLoading || networkError}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input 
          id="email" 
          type="email" 
          placeholder="name@example.com" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading || networkError}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Mật khẩu</Label>
        <Input 
          id="password" 
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isLoading || networkError}
          minLength={6}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
        <Input 
          id="confirmPassword" 
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          disabled={isLoading || networkError}
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="terms" 
          checked={acceptTerms}
          onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
          disabled={isLoading || networkError}
        />
        <Label htmlFor="terms" className="text-sm">
          Tôi đồng ý với{" "}
          <Link to="/terms" className="text-blue-600 hover:underline">
            điều khoản sử dụng
          </Link>{" "}
          và{" "}
          <Link to="/privacy" className="text-blue-600 hover:underline">
            chính sách bảo mật
          </Link>
        </Label>
      </div>
      
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
    </form>
  );
};

export default RegisterForm;
