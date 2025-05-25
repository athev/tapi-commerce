
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Store } from "lucide-react";
import RegisterPageLayout from "@/components/auth/RegisterPageLayout";

const RegisterChoice = () => {
  return (
    <RegisterPageLayout>
      <div className="space-y-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Chọn loại tài khoản</CardTitle>
            <p className="text-gray-600">Bạn muốn đăng ký với tư cách gì?</p>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <ShoppingCart className="mx-auto h-16 w-16 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Người mua</h3>
              <p className="text-gray-600 mb-4">
                Tìm kiếm và mua các sản phẩm số chất lượng cao
              </p>
              <Link to="/register-user">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Đăng ký làm người mua
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <Store className="mx-auto h-16 w-16 text-green-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Người bán</h3>
              <p className="text-gray-600 mb-4">
                Bán sản phẩm số của bạn và kiếm tiền online
              </p>
              <Link to="/register-seller">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Đăng ký làm người bán
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="text-center text-sm">
          Đã có tài khoản?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Đăng nhập
          </Link>
        </div>
      </div>
    </RegisterPageLayout>
  );
};

export default RegisterChoice;
