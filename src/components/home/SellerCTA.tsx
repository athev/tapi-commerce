
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Store, TrendingUp, Shield, Users } from "lucide-react";

const SellerCTA = () => {
  return (
    <section className="py-16 bg-gradient-to-r from-green-50 to-blue-50">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Bắt đầu bán hàng trên DigitalMarket</h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Tham gia cộng đồng người bán và kiếm tiền từ những sản phẩm số của bạn
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardContent className="p-6 text-center">
              <Store className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Dễ dàng thiết lập</h3>
              <p className="text-gray-600 text-sm">Tạo gian hàng và đăng sản phẩm chỉ trong vài phút</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Thu nhập ổn định</h3>
              <p className="text-gray-600 text-sm">Kiếm tiền từ ebook, khóa học, template và nhiều hơn nữa</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <Shield className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">An toàn & Bảo mật</h3>
              <p className="text-gray-600 text-sm">Hệ thống thanh toán an toàn và bảo vệ quyền lợi người bán</p>
            </CardContent>
          </Card>
        </div>
        
        <div className="text-center">
          <Button asChild size="lg" className="bg-green-600 hover:bg-green-700">
            <Link to="/register-seller">
              <Store className="mr-2 h-5 w-5" />
              Đăng ký bán hàng ngay
            </Link>
          </Button>
          <p className="text-sm text-gray-500 mt-4">
            Miễn phí đăng ký • Hoa hồng cạnh tranh • Hỗ trợ 24/7
          </p>
        </div>
      </div>
    </section>
  );
};

export default SellerCTA;
