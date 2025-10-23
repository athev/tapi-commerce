
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
  actualDescription?: string;
}

const QRPayment = ({ orderId, amount, onManualConfirmation, actualDescription }: QRPaymentProps) => {
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

      <Card className="border-2 border-primary/20 shadow-lg">
        <CardHeader className="text-center bg-gradient-to-r from-green-50 to-emerald-50">
          <CardTitle className="text-xl text-green-800 font-bold">
            Quét mã QR để thanh toán
          </CardTitle>
          <p className="text-sm text-green-700 mt-1">
            Mở app ngân hàng và quét mã QR bên dưới
          </p>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          {/* QR Code Display - Larger and more prominent */}
          <div className="flex justify-center">
            <div className="inline-block p-6 bg-white rounded-2xl border-4 border-blue-500 shadow-xl">
              <QRCodeDisplay 
                qrCodeUrl={qrCodeUrl} 
                orderId={orderId}
                amount={amount}
              />
            </div>
          </div>

          {/* Amount Display - More prominent */}
          <div className="text-center bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
            <p className="text-sm text-blue-700 mb-1">Số tiền thanh toán</p>
            <div className="text-4xl font-bold text-destructive">
              {formatPrice(amount)}
            </div>
            <p className="text-xs text-blue-600 mt-2">
              ✓ Nội dung chuyển khoản đã được điền sẵn
            </p>
          </div>

          {/* Bank Information */}
          <BankInformation 
            amount={amount} 
            orderId={orderId}
            actualDescription={actualDescription}
          />
        </CardContent>
      </Card>

      {/* Important Notice */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-500 p-4 rounded-r-lg shadow">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-blue-900 mb-1">Thanh toán tự động</p>
            <p className="text-blue-700 text-sm">
              Hệ thống sẽ tự động xác nhận thanh toán qua SEPAY trong vòng <span className="font-semibold">1-2 phút</span> sau khi bạn chuyển khoản thành công với đúng nội dung.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRPayment;
