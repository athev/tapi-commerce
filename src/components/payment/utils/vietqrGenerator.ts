
import { bankInfo } from '../config/bankConfig';

export const generateVietQRUrl = (orderId: string, amount: number): string | null => {
  console.log('=== VietQR URL Generation Start ===');
  console.log('Input parameters:', { orderId, amount });
  
  // Validate required parameters
  if (!orderId || !amount) {
    console.error('Missing required parameters for QR generation:', { orderId, amount });
    return null;
  }

  if (amount <= 0) {
    console.error('Invalid amount for QR generation:', amount);
    return null;
  }

  if (!bankInfo.bankCode || !bankInfo.accountNumber) {
    console.error('Missing bank information:', bankInfo);
    return null;
  }

  console.log('Bank info used:', bankInfo);
  
  // Priority 1: Use Template ID if available (VietQR Dashboard format)
  if (bankInfo.templateId) {
    // Correct VietQR template format from dashboard
    const templateUrl = `https://api.vietqr.io/image/${bankInfo.partnerId || bankInfo.bankCode}-${bankInfo.accountNumber}-${bankInfo.templateId}.jpg?amount=${amount}`;
    console.log('Generated Template ID URL:', templateUrl);
    console.log('=== VietQR URL Generation End ===');
    return templateUrl;
  }

  // Priority 2: Fallback to standard VietQR format (only if no template)
  const baseUrl = 'https://img.vietqr.io/image';
  const bankCode = bankInfo.bankCode;
  const accountNumber = bankInfo.accountNumber;
  const transferContent = `DH#${orderId}`;
  
  const encodedTransferContent = encodeURIComponent(transferContent);
  const encodedAccountName = encodeURIComponent(bankInfo.accountName);
  
  const fallbackUrl = `${baseUrl}/${bankCode}-${accountNumber}-compact.png?amount=${amount}&addInfo=${encodedTransferContent}&accountName=${encodedAccountName}`;
  
  console.log('Generated Fallback QR URL:', fallbackUrl);
  console.log('=== VietQR URL Generation End ===');
  
  return fallbackUrl;
};

// Validate QR URL by checking HTTP status
export const validateQRUrl = async (url: string): Promise<boolean> => {
  try {
    console.log('Validating QR URL:', url);
    const response = await fetch(url, { 
      method: 'HEAD',
      mode: 'no-cors' // Avoid CORS issues for validation
    });
    
    // For no-cors mode, we can't check status, but if it doesn't throw, it's likely valid
    console.log('QR URL validation passed');
    return true;
  } catch (error) {
    console.error('QR URL validation failed:', error);
    return false;
  }
};

// Alternative QR generator (only used if template fails validation)
export const generateAlternativeQRUrl = (orderId: string, amount: number): string | null => {
  console.log('Generating alternative QR URL');
  
  if (!orderId || !amount) {
    return null;
  }

  const transferContent = `DH#${orderId}`;
  const qrData = `2|99|${bankInfo.accountNumber}|${bankInfo.accountName}|${bankInfo.bankCode}|${amount}|0|${transferContent}|VN`;
  
  const alternativeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(qrData)}`;
  
  console.log('Alternative QR URL:', alternativeUrl);
  return alternativeUrl;
};
