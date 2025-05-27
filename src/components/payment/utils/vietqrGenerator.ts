
import { bankInfo } from '../config/bankConfig';

export const generateVietQRUrl = (orderId: string, amount: number): string | null => {
  // Validate required parameters
  if (!orderId || !amount) {
    console.error('Missing required parameters for QR generation:', { orderId, amount });
    return null;
  }

  const baseUrl = 'https://img.vietqr.io/image';
  const bankCode = bankInfo.bankCode;
  const accountNumber = bankInfo.accountNumber;
  const transferContent = `DH#${orderId}`;
  
  // Use proper encoding for URL parameters
  const encodedTransferContent = encodeURIComponent(transferContent);
  const encodedAccountName = encodeURIComponent(bankInfo.accountName);
  
  const qrUrl = `${baseUrl}/${bankCode}-${accountNumber}-compact.png?amount=${amount}&addInfo=${encodedTransferContent}&accountName=${encodedAccountName}`;
  
  console.log('Generated VietQR URL:', qrUrl);
  console.log('Parameters:', {
    orderId,
    amount,
    transferContent,
    bankCode,
    accountNumber
  });
  
  return qrUrl;
};
