
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context";
import { toast } from "sonner";
import RegisterForm from "@/components/auth/RegisterUserForm";
import RegisterPageLayout from "@/components/auth/RegisterPageLayout";
import RegisterUserPageHeader from "@/components/auth/RegisterUserPageHeader";
import RegisterNetworkStatus from "@/components/auth/RegisterNetworkStatus";

const RegisterUser = () => {
  const [networkError, setNetworkError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const { user, isOnline } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Đăng ký người mua | DigitalMarket";
    
    if (user) {
      navigate("/");
    }

    const checkNetwork = () => {
      setNetworkError(!navigator.onLine);
    };

    window.addEventListener('online', checkNetwork);
    window.addEventListener('offline', checkNetwork);
    
    checkNetwork();

    return () => {
      window.removeEventListener('online', checkNetwork);
      window.removeEventListener('offline', checkNetwork);
    };
  }, [user, navigate]);

  useEffect(() => {
    setNetworkError(!isOnline);
  }, [isOnline]);

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
        <RegisterUserPageHeader />
        <CardContent>
          <RegisterForm networkError={networkError} handleRetry={handleRetry} userType="end-user" />
        </CardContent>
      </Card>

      <RegisterNetworkStatus 
        networkError={networkError} 
        onRetry={handleRetry} 
      />
    </RegisterPageLayout>
  );
};

export default RegisterUser;
