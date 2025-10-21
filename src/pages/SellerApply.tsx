import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/context/AuthContext";
import { useSellerStatus } from "@/hooks/useSellerStatus";
import SellerApplicationForm from "@/components/seller/SellerApplicationForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, Clock, XCircle } from "lucide-react";

const SellerApply = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { sellerStatus, loading } = useSellerStatus();

  useEffect(() => {
    document.title = "Đăng ký người bán | DigitalMarket";
  }, []);

  useEffect(() => {
    if (!user && !loading) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  if (loading || !user) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 container py-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-marketplace-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  const renderContent = () => {
    switch (sellerStatus) {
      case 'approved_seller':
        return (
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <CardTitle>Bạn đã là người bán</CardTitle>
              </div>
              <CardDescription>
                Tài khoản của bạn đã được phê duyệt làm người bán
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link to="/seller">
                  Vào Dashboard Người bán
                </Link>
              </Button>
            </CardContent>
          </Card>
        );

      case 'pending_approval':
        return (
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Clock className="h-6 w-6 text-yellow-600" />
                <CardTitle>Đơn đăng ký đang chờ xét duyệt</CardTitle>
              </div>
              <CardDescription>
                Đơn đăng ký người bán của bạn đang được xem xét
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Chúng tôi sẽ xem xét đơn đăng ký của bạn và phản hồi trong thời gian sớm nhất. 
                Vui lòng kiểm tra email để nhận thông báo cập nhật.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-900">
                  <strong>Thời gian xét duyệt:</strong> Thường từ 1-3 ngày làm việc
                </p>
              </div>
            </CardContent>
          </Card>
        );

      case 'rejected':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <XCircle className="h-6 w-6 text-red-600" />
                  <CardTitle>Đơn đăng ký không được chấp nhận</CardTitle>
                </div>
                <CardDescription>
                  Đơn đăng ký người bán của bạn đã bị từ chối
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Bạn có thể gửi lại đơn đăng ký với thông tin đầy đủ hơn.
                </p>
              </CardContent>
            </Card>
            <SellerApplicationForm />
          </div>
        );

      case 'buyer':
      default:
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Trở thành người bán trên Sàn Phẩm Số</CardTitle>
                <CardDescription>
                  Mở rộng kinh doanh và tiếp cận hàng ngàn khách hàng tiềm năng
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
                      <h3 className="font-semibold mb-2">✨ Dễ dàng quản lý</h3>
                      <p className="text-sm text-muted-foreground">
                        Dashboard trực quan giúp quản lý sản phẩm và đơn hàng hiệu quả
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
                      <h3 className="font-semibold mb-2">💰 Thu nhập ổn định</h3>
                      <p className="text-sm text-muted-foreground">
                        Thanh toán nhanh chóng và minh bạch qua hệ thống ví điện tử
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
                      <h3 className="font-semibold mb-2">📈 Phát triển bền vững</h3>
                      <p className="text-sm text-muted-foreground">
                        Công cụ phân tích chi tiết giúp tối ưu chiến lược kinh doanh
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg">
                      <h3 className="font-semibold mb-2">🤝 Hỗ trợ tận tâm</h3>
                      <p className="text-sm text-muted-foreground">
                        Đội ngũ chăm sóc khách hàng luôn sẵn sàng hỗ trợ 24/7
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <SellerApplicationForm />
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container py-8">
        <div className="max-w-3xl mx-auto">
          {renderContent()}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SellerApply;
