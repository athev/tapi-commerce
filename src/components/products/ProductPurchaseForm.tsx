import { useState } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/utils/orderUtils";
import { upgradeAccountNoPassSchema, upgradeAccountWithPassSchema } from "@/lib/validationSchemas";
import PurchaseConfirmationModal from "./PurchaseConfirmationModal";
import { VoucherInput } from "@/components/payment/VoucherInput";

interface ProductPurchaseFormProps {
  isOpen: boolean;
  onClose: () => void;
  productType: string;
  product: any;
  currentPrice: number;
  selectedVariantId: string | null;
  selectedVariantName?: string;
  onConfirm: (buyerData: any) => void;
  isProcessing: boolean;
}

const ProductPurchaseForm = ({ 
  isOpen, 
  onClose, 
  productType, 
  product, 
  currentPrice,
  selectedVariantId,
  selectedVariantName,
  onConfirm,
  isProcessing
}: ProductPurchaseFormProps) => {
  const [buyerData, setBuyerData] = useState({
    email: '',
    username: '',
    password: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [appliedVoucher, setAppliedVoucher] = useState<any>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [finalPrice, setFinalPrice] = useState(currentPrice);

  const needsForm = ['upgrade_account_no_pass', 'upgrade_account_with_pass'].includes(productType);

  const validateInputs = () => {
    const newErrors: Record<string, string> = {};

    try {
      if (productType === 'upgrade_account_no_pass') {
        upgradeAccountNoPassSchema.parse(buyerData);
      } else if (productType === 'upgrade_account_with_pass') {
        upgradeAccountWithPassSchema.parse(buyerData);
      }
      return true;
    } catch (error: any) {
      if (error.errors) {
        error.errors.forEach((err: any) => {
          const field = err.path[0];
          newErrors[field] = err.message;
        });
      }
      setErrors(newErrors);
      return false;
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setBuyerData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleProceed = () => {
    if (needsForm && !validateInputs()) {
      return;
    }
    setShowConfirmModal(true);
  };

  const handleVoucherApplied = (voucher: any, discount: number) => {
    setAppliedVoucher(voucher);
    setDiscountAmount(discount);
    setFinalPrice(currentPrice - discount);
  };

  const handleConfirmPurchase = () => {
    setShowConfirmModal(false);
    onConfirm({ 
      ...buyerData, 
      variant_id: selectedVariantId,
      voucher_id: appliedVoucher?.id || null,
      discount_amount: discountAmount 
    });
    onClose();
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="bottom" className="h-[80vh] sm:h-auto sm:max-h-[80vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Thông tin đặt hàng</SheetTitle>
            <SheetDescription>
              {needsForm 
                ? "Vui lòng nhập thông tin để hoàn tất đơn hàng"
                : "Xác nhận đơn hàng của bạn"
              }
            </SheetDescription>
          </SheetHeader>
          
          <div className="space-y-6 py-6">
            {/* Form Fields - Only for upgrade account types */}
            {productType === 'upgrade_account_no_pass' && (
              <div className="space-y-2">
                <Label htmlFor="purchase-email">Email cần nâng cấp *</Label>
                <Input
                  id="purchase-email"
                  type="email"
                  value={buyerData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={errors.email ? "border-destructive" : ""}
                  placeholder="Nhập email cần nâng cấp"
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>
            )}

            {productType === 'upgrade_account_with_pass' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="purchase-email">Email *</Label>
                  <Input
                    id="purchase-email"
                    type="email"
                    value={buyerData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={errors.email ? "border-destructive" : ""}
                    placeholder="Nhập email"
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purchase-username">Tên đăng nhập *</Label>
                  <Input
                    id="purchase-username"
                    value={buyerData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    className={errors.username ? "border-destructive" : ""}
                    placeholder="Nhập tên đăng nhập"
                  />
                  {errors.username && (
                    <p className="text-sm text-destructive">{errors.username}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purchase-password">Mật khẩu *</Label>
                  <Input
                    id="purchase-password"
                    type="password"
                    value={buyerData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={errors.password ? "border-destructive" : ""}
                    placeholder="Nhập mật khẩu"
                  />
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password}</p>
                  )}
                </div>
              </div>
            )}
            
            {/* Voucher Input */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Mã giảm giá (nếu có)</Label>
              <VoucherInput 
                productId={product?.id}
                currentPrice={currentPrice}
                onVoucherApplied={handleVoucherApplied}
                preValidationMode={true}
              />
            </div>
            
            {/* Order Summary */}
            <Separator />
            <div className="space-y-3 bg-muted/50 p-4 rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Sản phẩm</span>
                <span className="font-medium">{product?.title}</span>
              </div>
              
              {discountAmount > 0 && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Giá gốc</span>
                    <span className="line-through">{formatPrice(currentPrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Giảm giá ({appliedVoucher?.code})</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                </>
              )}
              
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Tổng thanh toán</span>
                <span className="text-destructive">{formatPrice(finalPrice)}</span>
              </div>
            </div>
            
            <Button 
              size="lg" 
              className="w-full h-12 font-bold"
              onClick={handleProceed}
              disabled={isProcessing}
            >
              Xác nhận đơn hàng
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <PurchaseConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmPurchase}
        isProcessing={isProcessing}
        product={product}
        currentPrice={currentPrice}
        selectedVariantName={selectedVariantName}
        buyerData={buyerData}
      />
    </>
  );
};

export default ProductPurchaseForm;
