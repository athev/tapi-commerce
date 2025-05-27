
import { useState } from 'react';
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateAlternativeQRUrl } from './utils/vietqrGenerator';

interface QRCodeDisplayProps {
  qrCodeUrl: string | null;
  orderId?: string;
  amount?: number;
}

const QRCodeDisplay = ({ qrCodeUrl, orderId, amount }: QRCodeDisplayProps) => {
  const [qrImageError, setQrImageError] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [currentQrUrl, setCurrentQrUrl] = useState(qrCodeUrl);
  const [attemptCount, setAttemptCount] = useState(0);

  console.log('QRCodeDisplay rendered with URL:', currentQrUrl);

  const handleQrImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error('QR code failed to load:', currentQrUrl);
    console.error('Image error event:', event);
    console.error('Attempt count:', attemptCount);
    
    setQrImageError(true);
    
    // Auto-try alternative QR if this is the first failure and we have orderId/amount
    if (attemptCount === 0 && orderId && amount) {
      console.log('Auto-trying alternative QR generator...');
      const alternativeUrl = generateAlternativeQRUrl(orderId, amount);
      if (alternativeUrl && alternativeUrl !== currentQrUrl) {
        setCurrentQrUrl(alternativeUrl);
        setAttemptCount(1);
        setQrImageError(false);
        return;
      }
    }
  };

  const handleRetryQR = () => {
    console.log('Manually retrying QR code load');
    setIsRetrying(true);
    setQrImageError(false);
    
    // Try different URL on each retry
    if (attemptCount < 1 && orderId && amount) {
      const alternativeUrl = generateAlternativeQRUrl(orderId, amount);
      if (alternativeUrl) {
        setCurrentQrUrl(alternativeUrl);
        setAttemptCount(1);
      }
    } else {
      // Reset to original URL
      setCurrentQrUrl(qrCodeUrl);
      setAttemptCount(0);
    }
    
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
      {currentQrUrl && !qrImageError && !isRetrying ? (
        <div className="relative">
          <img 
            src={currentQrUrl} 
            alt="QR Code thanh toán VietQR" 
            className="w-64 h-64 border-2 border-gray-200 rounded-lg bg-white p-2"
            onError={handleQrImageError}
            onLoad={handleQrImageLoad}
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRetryQR}
                  className="text-xs"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Thử lại
                </Button>
                {process.env.NODE_ENV === 'development' && (
                  <div className="mt-2 text-xs text-gray-400">
                    <div>Attempt: {attemptCount}</div>
                    <div>URL: {currentQrUrl?.substring(0, 50)}...</div>
                  </div>
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
