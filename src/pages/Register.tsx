
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import { AlertCircle, Wifi, WifiOff } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const Register = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [networkError, setNetworkError] = useState(false);
  const { signUp, user } = useAuth();
  const { toast: toastNotification } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Đăng ký | DigitalMarket";
    
    // Redirect if user is already logged in
    if (user) {
      navigate("/");
    }

    // Check network connectivity
    const checkNetwork = () => {
      setNetworkError(!navigator.onLine);
    };

    // Set up event listeners for online/offline status
    window.addEventListener('online', checkNetwork);
    window.addEventListener('offline', checkNetwork);
    
    // Initial check
    checkNetwork();

    return () => {
      window.removeEventListener('online', checkNetwork);
      window.removeEventListener('offline', checkNetwork);
    };
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate network connection first
    if (!navigator.onLine) {
      setNetworkError(true);
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
    setNetworkError(false);
    
    try {
      const { error, success } = await signUp(email, password, fullName);
      
      if (success && !error) {
        // Show success message with sonner toast for better visibility
        toast.success("Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản.");
        
        // Redirect after a short delay
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      } else if (error) {
        if (error.message?.includes('network') || error.message?.includes('fetch')) {
          setNetworkError(true);
          toast.error("Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet và thử lại sau.");
        } else {
          toast.error(error.message || "Có lỗi xảy ra khi đăng ký. Vui lòng thử lại sau.");
        }
      }
    } catch (error) {
      console.error("Registration error:", error);
      
      if (error.message?.includes('fetch') || error.message?.includes('network') || !navigator.onLine) {
        setNetworkError(true);
        toast.error("Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet và thử lại sau.");
      } else {
        toast.error("Có lỗi xảy ra khi đăng ký. Vui lòng thử lại sau.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="container max-w-md py-12">
          {networkError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Lỗi kết nối</AlertTitle>
              <AlertDescription className="flex items-center gap-2">
                <WifiOff className="h-4 w-4" />
                Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet và thử lại sau.
              </AlertDescription>
            </Alert>
          )}
          
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">Đăng ký tài khoản</CardTitle>
              <CardDescription className="text-center">
                Nhập thông tin của bạn để tạo tài khoản mới
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Họ và tên</Label>
                  <Input 
                    id="fullName" 
                    placeholder="Nguyễn Văn A" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    disabled={isLoading}
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
                    disabled={isLoading}
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
                    disabled={isLoading}
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
                    disabled={isLoading}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="terms" 
                    checked={acceptTerms}
                    onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                    disabled={isLoading}
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
              </form>
              
              <div className="mt-6 text-center text-sm">
                Đã có tài khoản?{" "}
                <Link to="/login" className="text-blue-600 hover:underline">
                  Đăng nhập
                </Link>
              </div>
            </CardContent>
          </Card>

          {navigator.onLine && (
            <div className="mt-4 text-center text-sm text-gray-500">
              <div className="flex items-center justify-center gap-1">
                <Wifi className="h-3.5 w-3.5" /> 
                Trạng thái kết nối: Online
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Register;
