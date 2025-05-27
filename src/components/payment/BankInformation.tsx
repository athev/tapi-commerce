
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { bankInfo } from './config/bankConfig';

interface BankInformationProps {
  amount: number;
  orderId: string;
}

const BankInformation = ({ amount, orderId }: BankInformationProps) => {
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

  const transferContent = `DH#${orderId}`;

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
            <code className="text-sm bg-white px-2 py-1 rounded border">{transferContent}</code>
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
      </div>
    </div>
  );
};

export default BankInformation;
