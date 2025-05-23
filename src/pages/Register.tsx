
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import RegisterForm from "@/components/auth/RegisterForm";
import NetworkErrorAlert from "@/components/auth/NetworkErrorAlert";
import ConnectionStatus from "@/components/auth/ConnectionStatus";

const Register = () => {
  const [networkError, setNetworkError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const { user, isOnline } = useAuth();
  const navigate = useNavigate();

  // Check network connection on mount and when browser reports changes
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

  // Monitor isOnline from context
  useEffect(() => {
    setNetworkError(!isOnline);
  }, [isOnline]);

  // Handle retry attempts
  const handleRetry = () => {
    if (navigator.onLine) {
      setNetworkError(false);
      setRetryCount(prev => prev + 1);
      toast.info("Đang thử kết nối lại...");
    } else {
      toast.error("Bạn đang offline. Vui lòng kết nối internet và thử lại.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="container max-w-md py-12">
          {networkError && <NetworkErrorAlert onRetry={handleRetry} />}
          
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">Đăng ký tài khoản</CardTitle>
              <CardDescription className="text-center">
                Nhập thông tin của bạn để tạo tài khoản mới
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RegisterForm networkError={networkError} handleRetry={handleRetry} />
            </CardContent>
          </Card>

          <div className="mt-4 text-center text-sm text-gray-500">
            <ConnectionStatus isOnline={navigator.onLine} />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Register;
