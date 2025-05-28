
import { Button } from "@/components/ui/button";
import { Copy, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { bankInfo } from './config/bankConfig';

interface BankInformationProps {
  amount: number;
  orderId: string;
  actualDescription?: string;
}

const BankInformation = ({ amount, orderId, actualDescription }: BankInformationProps) => {
  const { toast } = useToast();

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Đã sao chép",
      description: `${label} đã được sao chép vào clipboard`,
    });
  };

  // Tạo nội dung chuyển khoản theo format ngắn: DH + hex (32 ký tự)
  const hexOrderId = orderId.replace(/-/g, '').toUpperCase();
  const transferContent = `DH${hexOrderId}`;

  return (
    <div className="bg-gray-50 p-4 rounded-lg space-y-3">
      <h4 className="font-semibold text-gray-800">Thông tin chuyển khoản</h4>
      
      <div className="grid grid-cols-1 gap-3">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Ngân hàng:</span>
          <span className="text-sm">{bankInfo.bankName}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Số tài khoản:</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono">{bankInfo.accountNumber}</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => copyToClipboard(bankInfo.accountNumber, "Số tài khoản")}
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Tên tài khoản:</span>
          <span className="text-sm">{bankInfo.accountName}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Số tiền:</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono">{formatAmount(amount)} VND</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => copyToClipboard(amount.toString(), "Số tiền")}
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Nội dung CK:</span>
          <div className="flex items-center gap-2">
            <code className="text-sm bg-white px-2 py-1 rounded border font-mono">{transferContent}</code>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => copyToClipboard(transferContent, "Nội dung chuyển khoản")}
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Display actual transaction description if available */}
        {actualDescription && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Nội dung đã được xác nhận:</span>
            </div>
            <div className="flex justify-between items-center">
              <code className="text-sm bg-white px-2 py-1 rounded border font-mono text-green-700">
                {actualDescription}
              </code>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => copyToClipboard(actualDescription, "Nội dung đã xác nhận")}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
            <p className="text-xs text-green-600 mt-2">
              ✅ Đây là nội dung chuyển khoản đã được hệ thống xử lý từ Casso
            </p>
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
        <p className="text-xs text-blue-700">
          <strong>Lưu ý quan trọng:</strong> Vui lòng nhập chính xác nội dung chuyển khoản <code className="bg-white px-1 rounded">{transferContent}</code> để hệ thống tự động xác nhận thanh toán.
        </p>
        <p className="text-xs text-gray-600 mt-1">
          💡 <strong>Mẹo:</strong> Sử dụng format "DH + 32 ký tự hex" (không có dấu gạch ngang)
        </p>
      </div>
    </div>
  );
};

export default BankInformation;
