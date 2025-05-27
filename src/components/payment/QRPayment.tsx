
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QRPaymentProps {
  orderId: string;
  amount: number;
  onManualConfirmation: () => void;
}

const QRPayment = ({ orderId, amount, onManualConfirmation }: QRPaymentProps) => {
  const { toast } = useToast();
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes in seconds
  const [showManualButton, setShowManualButton] = useState(false);

  // Bank information - static configuration for Casso
  const bankInfo = {
    bankName: 'MB Bank',
    bankCode: 'MBB',
    accountNumber: '567068888',
    accountName: 'LE THI HOAI ANH',
    transferContent: `DH#${orderId}`
  };

  // Generate VietQR URL for static QR code
  const generateVietQRUrl = () => {
    const baseUrl = 'https://img.vietqr.io/image';
    const bankCode = bankInfo.bankCode;
    const accountNumber = bankInfo.accountNumber;
    const params = new URLSearchParams({
      amount: amount.toString(),
      addInfo: bankInfo.transferContent,
      accountName: bankInfo.accountName
    });
    
    return `${baseUrl}/${bankCode}-${accountNumber}-compact.png?${params.toString()}`;
  };

  const qrCodeUrl = generateVietQRUrl();

  console.log('VietQR URL:', qrCodeUrl);
  console.log('Order ID:', orderId);
  console.log('Amount:', amount);
  console.log('Transfer content:', bankInfo.transferContent);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setShowManualButton(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Show manual button after 5 minutes (instead of 3)
    const manualButtonTimer = setTimeout(() => {
      setShowManualButton(true);
    }, 5 * 60 * 1000);

    return () => {
      clearInterval(timer);
      clearTimeout(manualButtonTimer);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND',
      maximumFractionDigits: 0 
    }).format(price);
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Đã sao chép",
      description: `${label} đã được sao chép vào clipboard`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Payment Timer */}
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-center space-x-2">
            <Clock className="h-5 w-5 text-blue-600" />
            <span className="text-lg font-semibold text-blue-700">
              Thời gian còn lại: {formatTime(timeLeft)}
            </span>
          </div>
          <p className="text-center text-sm text-blue-600 mt-2">
            Vui lòng hoàn tất thanh toán trong thời gian trên
          </p>
        </CardContent>
      </Card>

      {/* QR Code Payment */}
      <Card className="border-2 border-green-200">
        <CardHeader className="text-center">
          <CardTitle className="text-green-800">
            Quét mã QR để thanh toán
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Static VietQR Code */}
          <div className="flex justify-center">
            <img 
              src={qrCodeUrl} 
              alt="QR Code thanh toán VietQR" 
              className="w-64 h-64 border-2 border-gray-200 rounded-lg"
              onError={(e) => {
                console.error('QR code failed to load:', qrCodeUrl);
                // Fallback to a placeholder or manual transfer info
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>

          {/* Payment Amount */}
          <div className="text-center">
            <div className="text-2xl font-bold text-green-700">
              {formatPrice(amount)}
            </div>
            <p className="text-sm text-gray-600">Số tiền cần thanh toán</p>
          </div>

          {/* Bank Information */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <h4 className="font-semibold text-gray-800">Thông tin chuyển khoản</h4>
            
            <div className="grid grid-cols-1 gap-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Ngân hàng:</span>
                <span className="text-sm">{bankInfo.bankName}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Số tài khoản:</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono">{bankInfo.accountNumber}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => copyToClipboard(bankInfo.accountNumber, "Số tài khoản")}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Tên tài khoản:</span>
                <span className="text-sm">{bankInfo.accountName}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Số tiền:</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono">{formatAmount(amount)} VND</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => copyToClipboard(amount.toString(), "Số tiền")}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Nội dung CK:</span>
                <div className="flex items-center gap-2">
                  <code className="text-sm bg-white px-2 py-1 rounded border">{bankInfo.transferContent}</code>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => copyToClipboard(bankInfo.transferContent, "Nội dung chuyển khoản")}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Manual Confirmation Button - Show after 5 minutes */}
          {showManualButton && (
            <div className="pt-4 border-t">
              <Button 
                onClick={onManualConfirmation}
                className="w-full bg-orange-500 hover:bg-orange-600"
              >
                Tôi đã chuyển khoản - Xác nhận thủ công
              </Button>
              <p className="text-xs text-gray-500 text-center mt-2">
                Nếu đã chuyển khoản nhưng chưa được xác nhận tự động trong 5 phút, vui lòng bấm nút trên
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
        <p className="text-blue-700 text-sm">
          <span className="font-medium">Lưu ý:</span> Hệ thống sẽ tự động xác nhận thanh toán qua Casso trong vòng 1-2 phút sau khi bạn chuyển khoản thành công với đúng nội dung chuyển khoản. Webhook sẽ tự động cập nhật trạng thái đơn hàng.
        </p>
      </div>
    </div>
  );
};

export default QRPayment;
