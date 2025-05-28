
import { bankInfo } from '../config/bankConfig';

// Simple cache to prevent regeneration
const qrUrlCache = new Map<string, string>();

// Hàm tạo nội dung chuyển khoản đơn giản - chỉ sử dụng DH# + UUID đầy đủ
const generateTransferContent = (orderId: string): string => {
  // Sử dụng format đơn giản: DH# + UUID đầy đủ
  return `DH#${orderId}`;
};

export const generateVietQRUrl = (orderId: string, amount: number): string | null => {
  const cacheKey = `${orderId}-${amount}`;
  
  if (qrUrlCache.has(cacheKey)) {
    return qrUrlCache.get(cacheKey)!;
  }

  if (!orderId || !amount || amount <= 0) {
    console.error('Invalid parameters for QR generation:', { orderId, amount });
    return null;
  }

  if (!bankInfo.partnerId || !bankInfo.accountNumber || !bankInfo.templateId) {
    console.error('Missing bank configuration:', bankInfo);
    return null;
  }

  // Tạo nội dung chuyển khoản đơn giản: DH# + UUID đầy đủ
  const transferContent = generateTransferContent(orderId);
  
  // Use exact VietQR dashboard format with addInfo parameter
  const encodedAccountName = encodeURIComponent(bankInfo.accountName);
  const encodedTransferContent = encodeURIComponent(transferContent);
  const generatedUrl = `https://api.vietqr.io/image/${bankInfo.partnerId}-${bankInfo.accountNumber}-${bankInfo.templateId}.jpg?accountName=${encodedAccountName}&amount=${amount}&addInfo=${encodedTransferContent}`;
  
  console.log('Generated VietQR URL with transfer content:', generatedUrl);
  console.log('Transfer content format (simple DH# + UUID):', transferContent);
  
  qrUrlCache.set(cacheKey, generatedUrl);
  return generatedUrl;
};

// Alternative QR generator as fallback
export const generateAlternativeQRUrl = (orderId: string, amount: number): string | null => {
  if (!orderId || !amount) return null;

  const cacheKey = `alt-${orderId}-${amount}`;
  if (qrUrlCache.has(cacheKey)) {
    return qrUrlCache.get(cacheKey)!;
  }

  const transferContent = generateTransferContent(orderId);
  const qrData = `2|99|${bankInfo.accountNumber}|${bankInfo.accountName}|${bankInfo.bankCode}|${amount}|0|${transferContent}|VN`;
  const alternativeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(qrData)}`;
  
  qrUrlCache.set(cacheKey, alternativeUrl);
  return alternativeUrl;
};

export const clearQRUrlCache = () => {
  qrUrlCache.clear();
};
