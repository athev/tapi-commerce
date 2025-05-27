
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

  const baseUrl = 'https://img.vietqr.io/image';
  const bankCode = bankInfo.bankCode;
  const accountNumber = bankInfo.accountNumber;
  const transferContent = `DH#${orderId}`;
  
  console.log('Bank info used:', {
    bankCode,
    accountNumber,
    accountName: bankInfo.accountName
  });
  
  // Use proper encoding for URL parameters
  const encodedTransferContent = encodeURIComponent(transferContent);
  const encodedAccountName = encodeURIComponent(bankInfo.accountName);
  
  // Try different QR URL formats
  const qrUrls = [
    // Format 1: Standard compact format
    `${baseUrl}/${bankCode}-${accountNumber}-compact.png?amount=${amount}&addInfo=${encodedTransferContent}&accountName=${encodedAccountName}`,
    
    // Format 2: Without account name
    `${baseUrl}/${bankCode}-${accountNumber}-compact.png?amount=${amount}&addInfo=${encodedTransferContent}`,
    
    // Format 3: Simple format
    `${baseUrl}/${bankCode}-${accountNumber}-compact2.jpg?amount=${amount}&addInfo=${encodedTransferContent}`,
  ];
  
  const selectedUrl = qrUrls[0]; // Use the first format
  
  console.log('Generated VietQR URLs:', qrUrls);
  console.log('Selected URL:', selectedUrl);
  console.log('URL components:', {
    baseUrl,
    bankCode,
    accountNumber,
    amount,
    transferContent,
    encodedTransferContent,
    encodedAccountName
  });
  console.log('=== VietQR URL Generation End ===');
  
  return selectedUrl;
};

// Alternative QR generator using different service
export const generateAlternativeQRUrl = (orderId: string, amount: number): string | null => {
  console.log('Generating alternative QR URL');
  
  if (!orderId || !amount) {
    return null;
  }

  const transferContent = `DH#${orderId}`;
  const qrData = `2|99|${bankInfo.accountNumber}|${bankInfo.accountName}|${bankInfo.bankCode}|${amount}|0|${transferContent}|VN`;
  
  // Using QR API service
  const alternativeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(qrData)}`;
  
  console.log('Alternative QR URL:', alternativeUrl);
  return alternativeUrl;
};
