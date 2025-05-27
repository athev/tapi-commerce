
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import QRCode from 'qrcode';

interface QRPaymentProps {
  orderId: string;
  amount: number;
  onManualConfirmation: () => void;
}

const QRPayment = ({ orderId, amount, onManualConfirmation }: QRPaymentProps) => {
  const { toast } = useToast();
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes in seconds
  const [showManualButton, setShowManualButton] = useState(false);

  // Bank information
  const bankInfo = {
    bankName: 'Vietcombank',
    accountNumber: '1234567890',
    accountName: 'DIGITALMARKET CO',
    transferContent: `DH#${orderId}`
  };

  // Generate QR code
  useEffect(() => {
    const generateQR = async () => {
      try {
        // QR content for Vietnamese banking standard
        const qrContent = `${bankInfo.accountNumber}|${bankInfo.accountName}|${amount}|${bankInfo.transferContent}`;
        const qrUrl = await QRCode.toDataURL(qrContent, {
          width: 256,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        setQrCodeUrl(qrUrl);
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    };

    generateQR();
  }, [orderId, amount]);

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

    // Show manual button after 3 minutes
    const manualButtonTimer = setTimeout(() => {
      setShowManualButton(true);
    }, 3 * 60 * 1000);

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
          {/* QR Code */}
          <div className="flex justify-center">
            {qrCodeUrl ? (
              <img 
                src={qrCodeUrl} 
                alt="QR Code thanh toán" 
                className="w-64 h-64 border-2 border-gray-200 rounded-lg"
              />
            ) : (
              <div className="w-64 h-64 bg-gray-100 border-2 border-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-500">Đang tạo QR code...</span>
              </div>
            )}
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

          {/* Manual Confirmation Button */}
          {showManualButton && (
            <div className="pt-4 border-t">
              <Button 
                onClick={onManualConfirmation}
                className="w-full bg-orange-500 hover:bg-orange-600"
              >
                Tôi đã chuyển khoản - Xác nhận thủ công
              </Button>
              <p className="text-xs text-gray-500 text-center mt-2">
                Nếu đã chuyển khoản nhưng chưa được xác nhận tự động, vui lòng bấm nút trên
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
        <p className="text-blue-700 text-sm">
          <span className="font-medium">Lưu ý:</span> Hệ thống sẽ tự động xác nhận thanh toán trong vòng 1-2 phút sau khi bạn chuyển khoản thành công với đúng nội dung.
        </p>
      </div>
    </div>
  );
};

export default QRPayment;
