
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import RegisterForm from "@/components/auth/RegisterForm";
import RegisterPageLayout from "@/components/auth/RegisterPageLayout";
import RegisterPageHeader from "@/components/auth/RegisterPageHeader";
import RegisterNetworkStatus from "@/components/auth/RegisterNetworkStatus";

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
    <RegisterPageLayout>
      <RegisterNetworkStatus 
        networkError={networkError} 
        onRetry={handleRetry} 
      />
      
      <Card>
        <RegisterPageHeader />
        <CardContent>
          <RegisterForm networkError={networkError} handleRetry={handleRetry} />
        </CardContent>
      </Card>

      <RegisterNetworkStatus 
        networkError={networkError} 
        onRetry={handleRetry} 
      />
    </RegisterPageLayout>
  );
};

export default Register;
