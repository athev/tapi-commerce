
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Users, Key, UserCheck, Download, Headphones } from "lucide-react";

interface ProductTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

const ProductTypeSelector = ({ value, onChange, error }: ProductTypeSelectorProps) => {
  const productTypes = [
    {
      value: 'file_download',
      label: 'Tải xuống file',
      description: 'Khách hàng tải file sau khi thanh toán',
      icon: Download
    },
    {
      value: 'license_key_delivery',
      label: 'Gửi License Key',
      description: 'Tự động gửi license key qua email',
      icon: Key
    },
    {
      value: 'shared_account',
      label: 'Tài khoản dùng chung',
      description: 'CSKH sẽ liên hệ cung cấp thông tin đăng nhập',
      icon: Users
    },
    {
      value: 'upgrade_account_no_pass',
      label: 'Nâng cấp tài khoản (không mật khẩu)',
      description: 'Thu thập email để nâng cấp tài khoản',
      icon: UserCheck
    },
    {
      value: 'upgrade_account_with_pass',
      label: 'Nâng cấp tài khoản (có mật khẩu)',
      description: 'Thu thập email và mật khẩu để nâng cấp',
      icon: FileText
    },
    {
      value: 'service',
      label: 'Dịch vụ (Ticket-based)',
      description: '✅ Không cần upload file. Báo giá sau khi kiểm tra yêu cầu.',
      icon: Headphones
    }
  ];

  return (
    <div className="space-y-2">
      <Label htmlFor="product_type">Loại sản phẩm *</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={error ? "border-red-500" : ""}>
          <SelectValue placeholder="Chọn loại sản phẩm" />
        </SelectTrigger>
        <SelectContent>
          {productTypes.map((type) => {
            const Icon = type.icon;
            return (
              <SelectItem key={type.value} value={type.value}>
                <div className="flex items-center space-x-2">
                  <Icon className="h-4 w-4" />
                  <div>
                    <div className="font-medium">{type.label}</div>
                    <div className="text-xs text-gray-500">{type.description}</div>
                  </div>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
      
      {value && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-3">
            <div className="text-sm text-blue-800">
              {productTypes.find(t => t.value === value)?.description}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProductTypeSelector;
