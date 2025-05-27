
import { useState } from 'react';
import { AlertCircle } from "lucide-react";

interface QRCodeDisplayProps {
  qrCodeUrl: string | null;
}

const QRCodeDisplay = ({ qrCodeUrl }: QRCodeDisplayProps) => {
  const [qrImageError, setQrImageError] = useState(false);

  const handleQrImageError = () => {
    console.error('QR code failed to load:', qrCodeUrl);
    setQrImageError(true);
  };

  return (
    <div className="flex justify-center">
      {qrCodeUrl && !qrImageError ? (
        <div className="relative">
          <img 
            src={qrCodeUrl} 
            alt="QR Code thanh toán VietQR" 
            className="w-64 h-64 border-2 border-gray-200 rounded-lg bg-white p-2"
            onError={handleQrImageError}
            onLoad={() => console.log('QR code loaded successfully')}
          />
        </div>
      ) : (
        <div className="w-64 h-64 border-2 border-gray-200 rounded-lg bg-gray-100 flex items-center justify-center">
          <div className="text-center p-4">
            <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">
              Không thể tải mã QR
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Vui lòng sử dụng thông tin chuyển khoản bên dưới
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRCodeDisplay;
