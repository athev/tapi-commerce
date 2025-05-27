
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { generateVietQRUrl } from './utils/vietqrGenerator';
import { usePaymentTimer } from '@/hooks/usePaymentTimer';
import PaymentTimer from './PaymentTimer';
import QRCodeDisplay from './QRCodeDisplay';
import BankInformation from './BankInformation';
import ManualConfirmation from './ManualConfirmation';
import { useMemo } from 'react';

interface QRPaymentProps {
  orderId: string;
  amount: number;
  onManualConfirmation: () => void;
}

const QRPayment = ({ orderId, amount, onManualConfirmation }: QRPaymentProps) => {
  const { timeLeft, showManualButton, formatTime } = usePaymentTimer();
  
  // Stable QR URL generation with proper memoization
  const qrCodeUrl = useMemo(() => {
    if (!orderId || !amount) return null;
    return generateVietQRUrl(orderId, amount);
  }, [orderId, amount]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND',
      maximumFractionDigits: 0 
    }).format(price);
  };

  // Early return for missing data
  if (!orderId || !amount) {
    return (
      <Card className="border-2 border-yellow-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-center space-x-2">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <span className="text-yellow-700">
              Đang tải thông tin đơn hàng...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PaymentTimer timeLeft={timeLeft} formatTime={formatTime} />

      <Card className="border-2 border-green-200">
        <CardHeader className="text-center">
          <CardTitle className="text-green-800">
            Quét mã QR để thanh toán
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <QRCodeDisplay 
            qrCodeUrl={qrCodeUrl} 
            orderId={orderId}
            amount={amount}
          />

          <div className="text-center">
            <div className="text-2xl font-bold text-green-700">
              {formatPrice(amount)}
            </div>
            <p className="text-sm text-gray-600">Số tiền cần thanh toán</p>
          </div>

          <BankInformation amount={amount} orderId={orderId} />
          <ManualConfirmation 
            showManualButton={showManualButton} 
            onManualConfirmation={onManualConfirmation} 
          />
        </CardContent>
      </Card>

      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
        <p className="text-blue-700 text-sm">
          <span className="font-medium">Lưu ý:</span> Hệ thống sẽ tự động xác nhận thanh toán qua Casso trong vòng 1-2 phút sau khi bạn chuyển khoản thành công với đúng nội dung chuyển khoản.
        </p>
      </div>
    </div>
  );
};

export default QRPayment;
