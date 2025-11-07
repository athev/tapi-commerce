
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/context";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, Loader2, Chrome } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isRedirecting, setIsRedirecting] = useState(false);
  const { signIn, signInWithGoogle, user, session } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Đăng nhập | DigitalMarket";
  }, []);

  // Redirect if user is already logged in
  useEffect(() => {
    console.log('Login page: Auth state check:', { user: !!user, session: !!session });
    if (user && session) {
      console.log('Login page: User already authenticated, redirecting to home');
      navigate("/", { replace: true });
    }
  }, [user, session, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    
    try {
      console.log('Login page: Starting sign in process');
      const { error } = await signIn(email, password);
      
      if (error) {
        console.error('Login page: Sign in error:', error);
        
        // Check if error is due to unverified email
        if ((error as any).code === "email_not_confirmed") {
          setErrorMessage("Tài khoản của bạn chưa được xác thực. Đang chuyển hướng đến trang xác thực email...");
          setIsRedirecting(true);
          
          setTimeout(() => {
            navigate("/verify-email", { 
              state: { 
                email: (error as any).email || email,
                fromLogin: true 
              } 
            });
          }, 2000);
          return;
        }
        
        setErrorMessage(error.message || "Vui lòng kiểm tra lại email và mật khẩu");
      } else {
        console.log('Login page: Sign in successful, will redirect via useEffect');
        setErrorMessage("");
      }
    } catch (error) {
      console.error('Login page: Unexpected error:', error);
      setErrorMessage("Có lỗi xảy ra. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setErrorMessage("");
    
    try {
      console.log('Login page: Starting Google sign in');
      const { error } = await signInWithGoogle();
      
      if (error) {
        console.error('Login page: Google sign in error:', error);
        setErrorMessage(error.message || "Đăng nhập Google thất bại. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error('Login page: Unexpected Google error:', error);
      setErrorMessage("Có lỗi xảy ra. Vui lòng thử lại sau.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="container max-w-md py-12">
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">Đăng nhập</CardTitle>
              <CardDescription className="text-center">
                Nhập thông tin đăng nhập của bạn để truy cập vào tài khoản
              </CardDescription>
            </CardHeader>
            <CardContent>
              {errorMessage && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Đăng nhập thất bại</AlertTitle>
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="name@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Mật khẩu</Label>
                    <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">
                      Quên mật khẩu?
                    </Link>
                  </div>
                  <Input 
                    id="password" 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="remember" 
                    checked={remember}
                    onCheckedChange={(checked) => setRemember(checked as boolean)}
                  />
                  <Label htmlFor="remember" className="text-sm">Ghi nhớ đăng nhập</Label>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-marketplace-primary hover:bg-marketplace-primary/90"
                  disabled={isLoading || isGoogleLoading}
                >
                  {isLoading ? "Đang xử lý..." : "Đăng nhập"}
                </Button>
              </form>
              
              {/* Google Sign-In divider and button */}
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
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading || isLoading}
              >
                {isGoogleLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <Chrome className="mr-2 h-4 w-4" />
                    Đăng nhập với Google
                  </>
                )}
              </Button>
              
              <div className="mt-6 text-center text-sm">
                Chưa có tài khoản?{" "}
                <Link to="/register" className="text-blue-600 hover:underline">
                  Đăng ký ngay
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
      
      {isRedirecting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-6 max-w-sm">
            <div className="flex items-center space-x-3">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-sm">Đang chuyển hướng đến trang xác thực email...</p>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Login;
