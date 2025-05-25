
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, Mail, User, Key, Users, Info, Download, FileText } from "lucide-react";
import PurchaseConfirmationModal from "./PurchaseConfirmationModal";

interface ProductTypeOrderFormProps {
  productType: string;
  onPurchase: (buyerData?: any) => void;
  isProcessing: boolean;
  hasPurchased: boolean;
  product: any;
}

const ProductTypeOrderForm = ({ 
  productType, 
  onPurchase, 
  isProcessing, 
  hasPurchased,
  product 
}: ProductTypeOrderFormProps) => {
  const [buyerData, setBuyerData] = useState({
    email: '',
    username: '',
    password: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const validateInputs = () => {
    const newErrors: Record<string, string> = {};

    if (productType === 'upgrade_account_no_pass') {
      if (!buyerData.email.trim()) {
        newErrors.email = 'Email là bắt buộc';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(buyerData.email)) {
        newErrors.email = 'Email không hợp lệ';
      }
    }

    if (productType === 'upgrade_account_with_pass') {
      if (!buyerData.email.trim()) {
        newErrors.email = 'Email là bắt buộc';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(buyerData.email)) {
        newErrors.email = 'Email không hợp lệ';
      }

      if (!buyerData.username.trim()) {
        newErrors.username = 'Tên đăng nhập là bắt buộc';
      }

      if (!buyerData.password.trim()) {
        newErrors.password = 'Mật khẩu là bắt buộc';
      } else if (buyerData.password.length < 6) {
        newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePurchaseClick = () => {
    if (['upgrade_account_no_pass', 'upgrade_account_with_pass'].includes(productType)) {
      if (!validateInputs()) {
        return;
      }
    }
    setShowConfirmModal(true);
  };

  const handleConfirmPurchase = () => {
    setShowConfirmModal(false);
    if (['upgrade_account_no_pass', 'upgrade_account_with_pass'].includes(productType)) {
      onPurchase(buyerData);
    } else {
      onPurchase();
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setBuyerData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Get product type info
  const getProductTypeInfo = (type: string) => {
    const typeInfo = {
      file_download: {
        icon: Download,
        label: 'Tải tệp/File tải'
      },
      shared_account: {
        icon: Users,
        label: 'Tài khoản dùng chung'
      },
      upgrade_account_no_pass: {
        icon: User,
        label: 'Nâng cấp không cần mật khẩu'
      },
      upgrade_account_with_pass: {
        icon: FileText,
        label: 'Nâng cấp có mật khẩu'
      },
      license_key_delivery: {
        icon: Key,
        label: 'Mã kích hoạt'
      }
    };
    
    return typeInfo[type as keyof typeof typeInfo] || typeInfo.file_download;
  };

  const productTypeInfo = getProductTypeInfo(productType);
  const TypeIcon = productTypeInfo.icon;

  // After purchase UI - only show for file_download type
  if (hasPurchased && productType === 'file_download') {
    return (
      <div className="space-y-4">
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3 mb-3">
              <Download className="h-5 w-5 text-green-600" />
              <h3 className="font-medium text-green-900">Sản phẩm đã mua</h3>
            </div>
            <p className="text-sm text-green-800 mb-3">
              Bạn có thể tải xuống file ngay bây giờ.
            </p>
          </CardContent>
        </Card>
        
        <Button 
          className="w-full bg-green-600 hover:bg-green-700"
          onClick={() => {
            if (product?.file_url) {
              window.open(product.file_url, '_blank');
            } else {
              const link = document.createElement('a');
              link.href = 'data:text/plain;charset=utf-8,Sample Digital Product Content';
              link.download = `${product?.title || 'product'}.txt`;
              link.click();
            }
          }}
        >
          <Download className="h-5 w-5 mr-2" /> Tải xuống file
        </Button>
      </div>
    );
  }

  // Before purchase UI (for all product types, or after purchase for non-file-download types)
  return (
    <>
      <div className="space-y-4">
        {/* Product Type Info Card - Only show label without description */}
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <TypeIcon className="h-5 w-5 text-gray-600 flex-shrink-0" />
              <h3 className="font-medium text-gray-900">{productTypeInfo.label}</h3>
            </div>
          </CardContent>
        </Card>

        {/* Show success message for non-file-download products after purchase */}
        {hasPurchased && productType !== 'file_download' && (
          <Card className="bg-blue-50 border-blue-200 mb-4">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Info className="h-5 w-5 text-blue-600" />
                <div>
                  <h3 className="font-medium text-blue-900">Đơn hàng đã được tạo</h3>
                  <p className="text-sm text-blue-800">
                    Đơn hàng của bạn đã được tạo thành công. Bạn có thể mua thêm nếu cần.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Input fields for upgrade account types */}
        {productType === 'upgrade_account_no_pass' && (
          <div className="space-y-2">
            <Label htmlFor="buyer-email">Email cần nâng cấp *</Label>
            <Input
              id="buyer-email"
              type="email"
              value={buyerData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={errors.email ? "border-red-500" : ""}
              placeholder="Nhập email cần nâng cấp"
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>
        )}

        {productType === 'upgrade_account_with_pass' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="buyer-email">Email *</Label>
              <Input
                id="buyer-email"
                type="email"
                value={buyerData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={errors.email ? "border-red-500" : ""}
                placeholder="Nhập email"
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="buyer-username">Tên đăng nhập *</Label>
              <Input
                id="buyer-username"
                value={buyerData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                className={errors.username ? "border-red-500" : ""}
                placeholder="Nhập tên đăng nhập"
              />
              {errors.username && (
                <p className="text-sm text-red-500">{errors.username}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="buyer-password">Mật khẩu *</Label>
              <Input
                id="buyer-password"
                type="password"
                value={buyerData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={errors.password ? "border-red-500" : ""}
                placeholder="Nhập mật khẩu"
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
            </div>
          </div>
        )}

        {/* Purchase button - always show except for purchased file_download products */}
        <Button 
          className="w-full bg-marketplace-primary hover:bg-marketplace-primary/90"
          onClick={handlePurchaseClick}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Đang xử lý...
            </>
          ) : (
            <>
              <ShoppingCart className="h-5 w-5 mr-2" /> Mua ngay
            </>
          )}
        </Button>
      </div>

      {/* Confirmation Modal */}
      <PurchaseConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmPurchase}
        isProcessing={isProcessing}
        product={product}
        buyerData={buyerData}
      />
    </>
  );
};

export default ProductTypeOrderForm;
