
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const RegisterPageHeader = () => {
  return (
    <CardHeader className="space-y-1">
      <CardTitle className="text-2xl font-bold text-center">Đăng ký tài khoản</CardTitle>
      <CardDescription className="text-center">
        Nhập thông tin của bạn để tạo tài khoản mới
      </CardDescription>
    </CardHeader>
  );
};

export default RegisterPageHeader;
