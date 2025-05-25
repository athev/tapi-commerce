
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";

const RegisterUserPageHeader = () => {
  return (
    <CardHeader className="space-y-1">
      <div className="flex items-center justify-center mb-2">
        <ShoppingCart className="h-8 w-8 text-blue-600" />
      </div>
      <CardTitle className="text-2xl font-bold text-center">Đăng ký tài khoản người mua</CardTitle>
      <CardDescription className="text-center">
        Tạo tài khoản để mua sắm các sản phẩm số chất lượng cao
      </CardDescription>
    </CardHeader>
  );
};

export default RegisterUserPageHeader;
