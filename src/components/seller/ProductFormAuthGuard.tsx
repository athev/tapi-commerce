
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useSellerRegistration } from "@/hooks/useSellerRegistration";

interface ProductFormAuthGuardProps {
  children: React.ReactNode;
}

const ProductFormAuthGuard = ({ children }: ProductFormAuthGuardProps) => {
  const navigate = useNavigate();
  const { user, profile, session, loading, profileLoading } = useAuth();
  const { isRegistering, registerAsSeller } = useSellerRegistration();
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  useEffect(() => {
    console.log('ProductFormAuthGuard auth state:', { 
      user: !!user, 
      profile: !!profile, 
      session: !!session, 
      loading, 
      profileLoading 
    });
    
    if (loading || profileLoading) {
      const timer = setTimeout(() => {
        console.log('Loading timeout reached, forcing render');
        setLoadingTimeout(true);
      }, 5000);
      
      return () => clearTimeout(timer);
    } else {
      setLoadingTimeout(false);
    }
  }, [loading, profileLoading, user, profile, session]);

  const handleSellerRegistration = async () => {
    const success = await registerAsSeller();
    if (success) {
      console.log('Seller registration successful, profile should refresh');
    }
  };

  // Show loading while auth or profile is loading
  if ((loading || profileLoading) && !loadingTimeout) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <span className="ml-2">
              {loading ? 'Đang tải...' : 'Đang tải thông tin người dùng...'}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!user || !session) {
    console.log('User not authenticated, redirecting to login');
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Bạn cần đăng nhập
            </h3>
            <p className="text-gray-500 mb-4">
              Vui lòng đăng nhập để tạo sản phẩm mới
            </p>
            <Button onClick={() => navigate('/login')}>
              Đăng nhập
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!profile || loadingTimeout || (profile && profile.role !== 'seller')) {
    console.log('Profile missing, loading timed out, or user is not a seller:', { 
      profile: !!profile, 
      loadingTimeout, 
      role: profile?.role 
    });
    
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {loadingTimeout 
                ? 'Không thể tải thông tin người bán' 
                : profile?.role !== 'seller' 
                  ? 'Bạn chưa có gian hàng'
                  : 'Bạn chưa có gian hàng'
              }
            </h3>
            <p className="text-gray-500 mb-4">
              {loadingTimeout 
                ? 'Có lỗi xảy ra khi tải thông tin. Vui lòng thử lại hoặc đăng ký làm người bán.'
                : 'Vui lòng đăng ký làm người bán để tạo sản phẩm'
              }
            </p>
            <div className="space-x-2">
              <Button 
                onClick={handleSellerRegistration}
                disabled={isRegistering}
                className="bg-green-600 hover:bg-green-700"
              >
                {isRegistering ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></span>
                    Đang đăng ký...
                  </>
                ) : (
                  'Đăng ký người bán'
                )}
              </Button>
              {loadingTimeout && (
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Tải lại trang
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  console.log('ProductFormAuthGuard rendering with valid seller auth state');
  return <>{children}</>;
};

export default ProductFormAuthGuard;
