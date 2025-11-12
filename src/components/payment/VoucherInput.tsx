import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Ticket, X } from 'lucide-react';
import { useVoucherValidation } from '@/hooks/useVoucherValidation';
import { formatPrice } from '@/utils/priceUtils';
import { toast } from 'sonner';

interface VoucherInputProps {
  orderId: string;
  productId: string;
  currentPrice: number;
  onVoucherApplied: (voucher: any, discount: number) => void;
}

export const VoucherInput = ({ orderId, productId, currentPrice, onVoucherApplied }: VoucherInputProps) => {
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<any>(null);
  const [discount, setDiscount] = useState(0);
  
  const { isValidating, validateVoucher, calculateDiscount, applyVoucher } = useVoucherValidation();

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      toast.error('Vui lòng nhập mã giảm giá');
      return;
    }

    const result = await validateVoucher(voucherCode, productId, currentPrice);

    if (!result.valid) {
      toast.error(result.error);
      return;
    }

    const discountAmount = calculateDiscount(result.voucher, currentPrice);
    
    const applyResult = await applyVoucher(orderId, result.voucher.id, discountAmount);
    
    if (!applyResult.success) {
      toast.error(applyResult.error || 'Không thể áp dụng mã');
      return;
    }

    setAppliedVoucher(result.voucher);
    setDiscount(discountAmount);
    onVoucherApplied(result.voucher, discountAmount);

    toast.success('Áp dụng mã thành công! 🎉', {
      description: `Bạn được giảm ${formatPrice(discountAmount)}`,
    });
  };

  const handleRemoveVoucher = async () => {
    await applyVoucher(orderId, '', 0);
    setAppliedVoucher(null);
    setDiscount(0);
    setVoucherCode('');
    onVoucherApplied(null, 0);
    toast.info('Đã xóa mã giảm giá');
  };

  const formatDiscountDisplay = (voucher: any) => {
    if (voucher.discount_type === 'fixed_amount') {
      return formatPrice(voucher.discount_value);
    }
    return `${voucher.discount_value}%`;
  };

  if (appliedVoucher) {
    return (
      <Card className="mb-4 border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Ticket className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="font-medium text-green-900">
                  {appliedVoucher.code}
                </div>
                <div className="text-sm text-green-700">
                  Giảm {formatDiscountDisplay(appliedVoucher)} • Tiết kiệm {formatPrice(discount)}
                </div>
              </div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleRemoveVoucher}
              className="text-green-700 hover:text-green-900 hover:bg-green-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Nhập mã giảm giá"
              value={voucherCode}
              onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
              className="pl-10"
              disabled={isValidating}
            />
          </div>
          <Button 
            onClick={handleApplyVoucher}
            disabled={isValidating || !voucherCode.trim()}
          >
            {isValidating ? 'Đang kiểm tra...' : 'Áp dụng'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
