import { useState, useEffect } from 'react';
import { X, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

interface LoginIncentiveBannerProps {
  isLoggedIn: boolean;
  hasPurchased: boolean;
}

export const LoginIncentiveBanner = ({ isLoggedIn, hasPurchased }: LoginIncentiveBannerProps) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const dismissed = localStorage.getItem('loginBannerDismissed');
    if (dismissed) {
      setIsDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('loginBannerDismissed', 'true');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleRegister = () => {
    navigate('/register-choice');
  };

  // Only show if: not logged in OR logged in but hasn't purchased
  const shouldShow = (!isLoggedIn || (isLoggedIn && !hasPurchased)) && !isDismissed;

  if (!shouldShow) return null;

  return (
    <Card className="relative overflow-hidden border-2 border-primary/30 bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 animate-in slide-in-from-top duration-500">
      <div className="absolute top-2 right-2 z-10">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 rounded-full hover:bg-white/50"
          onClick={handleDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="p-4 sm:p-6">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full flex items-center justify-center animate-pulse">
              <Gift className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0 space-y-2 sm:space-y-3">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">
                🎁 ĐĂNG NHẬP ĐỂ NHẬN QUÀ TẶNG!
              </h3>
              <p className="text-sm text-gray-800 font-medium mb-1">
                Vui lòng đăng nhập để mua hàng và nhận quà tặng
              </p>
              <p className="text-sm sm:text-base text-gray-700">
                Đăng nhập ngay để được <span className="font-bold text-primary">tặng miễn phí Canva Pro 1 tháng</span> cho đơn hàng đầu tiên!
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
              <Button
                onClick={handleRegister}
                className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-bold h-10 px-6 shadow-md hover:shadow-lg transition-all"
              >
                Đăng ký ngay
              </Button>
              <button
                onClick={handleLogin}
                className="text-primary hover:text-primary/80 font-medium text-sm underline-offset-4 hover:underline transition-colors"
              >
                Đăng nhập
              </button>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>Chương trình có giới hạn - Nhanh tay!</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
