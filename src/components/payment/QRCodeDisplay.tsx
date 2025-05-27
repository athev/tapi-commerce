
import { useState, useEffect, useRef, useMemo } from 'react';
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
  const [primaryQrLoaded, setPrimaryQrLoaded] = useState(false);
  const hasLoggedError = useRef(false);
  const retryCount = useRef(0);

  // Memoize alternative QR URL to prevent regeneration
  const alternativeQrUrl = useMemo(() => {
    if (orderId && amount) {
      return generateAlternativeQRUrl(orderId, amount);
    }
    return null;
  }, [orderId, amount]);

  console.log('QRCodeDisplay rendered with URL:', currentQrUrl);

  // Reset states when qrCodeUrl changes
  useEffect(() => {
    setCurrentQrUrl(qrCodeUrl);
    setQrImageError(false);
    setHasTriedFallback(false);
    setPrimaryQrLoaded(false);
    hasLoggedError.current = false;
    retryCount.current = 0;
  }, [qrCodeUrl]);

  const handleQrImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    // Prevent infinite retries
    retryCount.current += 1;
    
    // Only log error once to prevent infinite console logs
    if (!hasLoggedError.current) {
      console.error('QR code failed to load:', currentQrUrl);
      hasLoggedError.current = true;
    }
    
    setQrImageError(true);
    
    // Only auto-switch if we haven't tried fallback yet, haven't exceeded retry limit, and we have fallback data
    if (!hasTriedFallback && retryCount.current <= 1 && !primaryQrLoaded && alternativeQrUrl) {
      console.log('Switching to alternative QR generator (one time only)...');
      setCurrentQrUrl(alternativeQrUrl);
      setHasTriedFallback(true);
      setQrImageError(false);
      hasLoggedError.current = false; // Allow logging for alternative URL
    }
  };

  const handleQrImageLoad = () => {
    // Only log if not already logged to prevent spam
    if (!primaryQrLoaded || currentQrUrl !== qrCodeUrl) {
      console.log('QR code loaded successfully:', currentQrUrl);
    }
    
    setQrImageError(false);
    setIsRetrying(false);
    
    // Mark primary QR as loaded if it's the original URL
    if (currentQrUrl === qrCodeUrl) {
      setPrimaryQrLoaded(true);
      console.log('Primary VietQR template loaded successfully - no fallback needed');
    }
  };

  const handleRetryQR = () => {
    console.log('Manually retrying QR code load');
    setIsRetrying(true);
    setQrImageError(false);
    hasLoggedError.current = false;
    retryCount.current = 0;
    
    // Reset to original URL and try again
    setCurrentQrUrl(qrCodeUrl);
    setHasTriedFallback(false);
    setPrimaryQrLoaded(false);
    
    setTimeout(() => {
      setIsRetrying(false);
    }, 1000);
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
          {currentQrUrl === qrCodeUrl && (
            <div className="mt-1 text-center">
              <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                VietQR Template
              </span>
            </div>
          )}
          {currentQrUrl !== qrCodeUrl && (
            <div className="mt-1 text-center">
              <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                QR Dự phòng
              </span>
            </div>
          )}
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
                  disabled={retryCount.current > 2}
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  {retryCount.current > 2 ? 'Đã thử quá nhiều' : 'Thử lại'}
                </Button>
                {process.env.NODE_ENV === 'development' && (
                  <div className="mt-2 text-xs text-gray-400">
                    <div>Fallback tried: {hasTriedFallback ? 'Yes' : 'No'}</div>
                    <div>Retry count: {retryCount.current}</div>
                    <div>Primary Loaded: {primaryQrLoaded ? 'Yes' : 'No'}</div>
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
