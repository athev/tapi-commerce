
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Store } from "lucide-react";

const RegisterSellerPageHeader = () => {
  return (
    <CardHeader className="space-y-1">
      <div className="flex items-center justify-center mb-2">
        <Store className="h-8 w-8 text-green-600" />
      </div>
      <CardTitle className="text-2xl font-bold text-center">Đăng ký tài khoản người bán</CardTitle>
      <CardDescription className="text-center">
        Tạo tài khoản để bán sản phẩm số và kiếm tiền online
      </CardDescription>
    </CardHeader>
  );
};

export default RegisterSellerPageHeader;
