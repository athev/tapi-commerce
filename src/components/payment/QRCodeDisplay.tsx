
import { useState, useEffect, useCallback } from 'react';
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
  const [hasTriedFallback, setHasTriedFallback] = useState(false);
  const [retryAttempts, setRetryAttempts] = useState(0);

  // Reset states when qrCodeUrl prop changes
  useEffect(() => {
    if (qrCodeUrl !== currentQrUrl) {
      setCurrentQrUrl(qrCodeUrl);
      setQrImageError(false);
      setHasTriedFallback(false);
      setRetryAttempts(0);
      setIsRetrying(false);
    }
  }, [qrCodeUrl, currentQrUrl]);

  const handleQrImageError = useCallback((event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error('QR image failed to load:', currentQrUrl);
    
    setRetryAttempts(prev => prev + 1);
    setQrImageError(true);
    
    // Only try fallback once and if we have the required data
    if (!hasTriedFallback && orderId && amount && retryAttempts === 0) {
      const fallbackUrl = generateAlternativeQRUrl(orderId, amount);
      if (fallbackUrl) {
        console.log('Switching to fallback QR:', fallbackUrl);
        setCurrentQrUrl(fallbackUrl);
        setHasTriedFallback(true);
        setQrImageError(false);
      }
    }
  }, [currentQrUrl, hasTriedFallback, orderId, amount, retryAttempts]);

  const handleQrImageLoad = useCallback(() => {
    console.log('QR image loaded successfully:', currentQrUrl);
    setQrImageError(false);
    setIsRetrying(false);
  }, [currentQrUrl]);

  const handleRetryQR = useCallback(() => {
    console.log('Manual retry triggered');
    setIsRetrying(true);
    setQrImageError(false);
    setRetryAttempts(0);
    setHasTriedFallback(false);
    setCurrentQrUrl(qrCodeUrl);
    
    setTimeout(() => setIsRetrying(false), 1000);
  }, [qrCodeUrl]);

  const isUsingFallback = currentQrUrl !== qrCodeUrl;
  const maxRetriesReached = retryAttempts >= 2;

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
              disabled={maxRetriesReached}
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              {maxRetriesReached ? 'Đã thử tối đa' : 'Tải lại QR'}
            </Button>
          </div>
          <div className="mt-1 text-center">
            <span className={`text-xs px-2 py-1 rounded ${
              isUsingFallback 
                ? 'text-yellow-600 bg-yellow-50' 
                : 'text-green-600 bg-green-50'
            }`}>
              {isUsingFallback ? 'QR Dự phòng' : 'VietQR Template'}
            </span>
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
                <p className="text-sm text-gray-500 mb-2">Không thể tải mã QR</p>
                <p className="text-xs text-gray-400 mb-3">
                  Vui lòng sử dụng thông tin chuyển khoản bên dưới
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRetryQR}
                  className="text-xs"
                  disabled={maxRetriesReached}
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  {maxRetriesReached ? 'Đã thử quá nhiều' : 'Thử lại'}
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QRCodeDisplay;
