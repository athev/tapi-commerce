
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, X } from "lucide-react";

interface PurchaseConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isProcessing: boolean;
  product: {
    title: string;
    price: number;
    product_type?: string;
  };
  buyerData?: {
    email?: string;
    username?: string;
  };
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', { 
    style: 'currency', 
    currency: 'VND',
    maximumFractionDigits: 0 
  }).format(price);
};

const getProductTypeLabel = (type: string) => {
  const types = {
    file_download: 'Tải tệp/File tải',
    license_key_delivery: 'Mã kích hoạt',
    shared_account: 'Tài khoản dùng chung',
    upgrade_account_no_pass: 'Nâng cấp không cần mật khẩu',
    upgrade_account_with_pass: 'Nâng cấp có mật khẩu'
  };
  return types[type as keyof typeof types] || type;
};

const PurchaseConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  isProcessing,
  product,
  buyerData
}: PurchaseConfirmationModalProps) => {
  const quantity = 1;
  const discount = 0; // Can be extended later
  const totalAmount = product.price;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-marketplace-primary" />
            Xác nhận đơn hàng
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Product Info */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <div>
              <h4 className="font-medium text-gray-900 mb-1">{product.title}</h4>
              {product.product_type && (
                <Badge variant="outline" className="text-xs">
                  {getProductTypeLabel(product.product_type)}
                </Badge>
              )}
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Số lượng:</span>
              <span className="font-medium">{quantity}</span>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Giá:</span>
              <span className="font-medium">{formatPrice(product.price)}</span>
            </div>
            
            {discount > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Giảm giá:</span>
                <span className="font-medium text-green-600">-{discount}%</span>
              </div>
            )}
            
            <div className="border-t pt-2">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-900">Tổng tiền:</span>
                <span className="font-bold text-lg text-marketplace-primary">
                  {formatPrice(totalAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* Buyer Info */}
          {buyerData && (buyerData.email || buyerData.username) && (
            <div className="bg-blue-50 p-4 rounded-lg space-y-2">
              <h5 className="font-medium text-blue-900 text-sm">Thông tin giao hàng:</h5>
              {buyerData.email && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-blue-700">Email:</span>
                  <span className="font-medium text-blue-900">{buyerData.email}</span>
                </div>
              )}
              {buyerData.username && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-blue-700">Tên đăng nhập:</span>
                  <span className="font-medium text-blue-900">{buyerData.username}</span>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1"
          >
            <X className="h-4 w-4 mr-2" />
            Đóng
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isProcessing}
            className="flex-1 bg-marketplace-primary hover:bg-marketplace-primary/90"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Đang xử lý...
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Mua hàng
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PurchaseConfirmationModal;
