
import { useState } from 'react';
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QRCodeDisplayProps {
  qrCodeUrl: string | null;
}

const QRCodeDisplay = ({ qrCodeUrl }: QRCodeDisplayProps) => {
  const [qrImageError, setQrImageError] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  console.log('QRCodeDisplay rendered with URL:', qrCodeUrl);

  const handleQrImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error('QR code failed to load:', qrCodeUrl);
    console.error('Image error event:', event);
    setQrImageError(true);
  };

  const handleRetryQR = () => {
    console.log('Retrying QR code load');
    setIsRetrying(true);
    setQrImageError(false);
    
    // Force reload after a short delay
    setTimeout(() => {
      setIsRetrying(false);
    }, 1000);
  };

  const handleQrImageLoad = () => {
    console.log('QR code loaded successfully');
    setQrImageError(false);
    setIsRetrying(false);
  };

  return (
    <div className="flex justify-center">
      {qrCodeUrl && !qrImageError && !isRetrying ? (
        <div className="relative">
          <img 
            src={qrCodeUrl} 
            alt="QR Code thanh toán VietQR" 
            className="w-64 h-64 border-2 border-gray-200 rounded-lg bg-white p-2"
            onError={handleQrImageError}
            onLoad={handleQrImageLoad}
            crossOrigin="anonymous"
          />
          <div className="mt-2 text-center">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetryQR}
              className="text-xs"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Tải lại QR
            </Button>
          </div>
        </div>
      ) : (
        <div className="w-64 h-64 border-2 border-gray-200 rounded-lg bg-gray-100 flex items-center justify-center">
          <div className="text-center p-4">
            {isRetrying ? (
              <>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mx-auto mb-2"></div>
                <p className="text-sm text-gray-500">Đang tải mã QR...</p>
              </>
            ) : (
              <>
                <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500 mb-2">
                  Không thể tải mã QR
                </p>
                <p className="text-xs text-gray-400 mb-3">
                  Vui lòng sử dụng thông tin chuyển khoản bên dưới
                </p>
                {qrCodeUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRetryQR}
                    className="text-xs"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Thử lại
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QRCodeDisplay;
