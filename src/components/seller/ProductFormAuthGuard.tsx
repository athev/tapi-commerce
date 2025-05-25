
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
  const { user, profile, session } = useAuth();
  const { isRegistering, registerAsSeller } = useSellerRegistration();

  useEffect(() => {
    console.log('ProductFormAuthGuard auth state:', { 
      user: !!user, 
      profile: !!profile, 
      session: !!session
    });
  }, [user, profile, session]);

  const handleSellerRegistration = async () => {
    const success = await registerAsSeller();
    if (success) {
      console.log('Seller registration successful, profile should refresh');
    }
  };

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

  if (!profile || profile.role !== 'seller') {
    console.log('User is not a seller:', { 
      profile: !!profile, 
      role: profile?.role 
    });
    
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Bạn chưa đăng ký gian hàng
            </h3>
            <p className="text-gray-500 mb-4">
              Bấm vào đây để tạo gian hàng đầu tiên
            </p>
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
                'Đăng ký làm người bán'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  console.log('ProductFormAuthGuard rendering with valid seller auth state');
  return <>{children}</>;
};

export default ProductFormAuthGuard;
