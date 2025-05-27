
import { useState, useEffect } from 'react';
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateAlternativeQRUrl, validateQRUrl } from './utils/vietqrGenerator';

interface QRCodeDisplayProps {
  qrCodeUrl: string | null;
  orderId?: string;
  amount?: number;
}

const QRCodeDisplay = ({ qrCodeUrl, orderId, amount }: QRCodeDisplayProps) => {
  const [qrImageError, setQrImageError] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [currentQrUrl, setCurrentQrUrl] = useState(qrCodeUrl);
  const [hasValidated, setHasValidated] = useState(false);
  const [isUsingTemplate, setIsUsingTemplate] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  console.log('QRCodeDisplay rendered with URL:', currentQrUrl);

  // Check if using VietQR template
  useEffect(() => {
    if (qrCodeUrl?.includes('api.vietqr.io') && qrCodeUrl?.includes('gziC5bl')) {
      setIsUsingTemplate(true);
      console.log('Using VietQR Template ID');
    } else {
      setIsUsingTemplate(false);
    }
  }, [qrCodeUrl]);

  // Validate QR URL on mount (only once)
  useEffect(() => {
    const validateInitialQR = async () => {
      if (qrCodeUrl && !hasValidated && isUsingTemplate) {
        console.log('Validating initial template QR URL...');
        const isValid = await validateQRUrl(qrCodeUrl);
        
        if (!isValid && retryCount === 0) {
          console.log('Template QR validation failed, switching to alternative');
          handleSwitchToAlternative();
        }
        
        setHasValidated(true);
      }
    };

    validateInitialQR();
  }, [qrCodeUrl, hasValidated, isUsingTemplate, retryCount]);

  const handleSwitchToAlternative = () => {
    if (orderId && amount && retryCount < 1) {
      console.log('Switching to alternative QR generator...');
      const alternativeUrl = generateAlternativeQRUrl(orderId, amount);
      if (alternativeUrl) {
        setCurrentQrUrl(alternativeUrl);
        setRetryCount(1);
        setIsUsingTemplate(false);
        setQrImageError(false);
      }
    }
  };

  const handleQrImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error('QR code failed to load:', currentQrUrl);
    console.error('Retry count:', retryCount);
    
    setQrImageError(true);
    
    // Only auto-switch if using template and haven't retried yet
    if (isUsingTemplate && retryCount === 0 && orderId && amount) {
      console.log('Template QR failed, auto-switching to alternative...');
      handleSwitchToAlternative();
      return;
    }
    
    console.log('QR load failed, showing error state');
  };

  const handleRetryQR = () => {
    console.log('Manually retrying QR code load');
    setIsRetrying(true);
    setQrImageError(false);
    
    if (retryCount < 1 && orderId && amount) {
      handleSwitchToAlternative();
    } else {
      // Reset to original URL
      setCurrentQrUrl(qrCodeUrl);
      setRetryCount(0);
      setIsUsingTemplate(qrCodeUrl?.includes('api.vietqr.io') || false);
    }
    
    setTimeout(() => {
      setIsRetrying(false);
    }, 1000);
  };

  const handleQrImageLoad = () => {
    console.log('QR code loaded successfully:', currentQrUrl);
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
          {isUsingTemplate && (
            <div className="mt-1 text-center">
              <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                VietQR Template
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
                  disabled={retryCount >= 2}
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  {retryCount >= 2 ? 'Đã thử lại' : 'Thử lại'}
                </Button>
                {process.env.NODE_ENV === 'development' && (
                  <div className="mt-2 text-xs text-gray-400">
                    <div>Retry: {retryCount}/1</div>
                    <div>Template: {isUsingTemplate ? 'Yes' : 'No'}</div>
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
