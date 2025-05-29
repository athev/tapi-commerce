
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, Clock, CheckCircle, TrendingUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

interface TransactionHistoryProps {
  walletLogs: any[];
  isLoading: boolean;
}

const formatPI = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { 
    minimumFractionDigits: 0,
    maximumFractionDigits: 2 
  }).format(amount) + " PI";
};

const formatVND = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { 
    style: 'currency', 
    currency: 'VND',
    maximumFractionDigits: 0 
  }).format(amount);
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const TransactionHistory = ({ walletLogs, isLoading }: TransactionHistoryProps) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Chờ xử lý</Badge>;
      case 'released':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Đã nhận</Badge>;
      case 'disputed':
        return <Badge variant="destructive"><TrendingUp className="h-3 w-3 mr-1" />Tranh chấp</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'earning':
        return 'Thu nhập bán hàng';
      case 'withdrawal':
        return 'Rút tiền';
      case 'dispute_hold':
        return 'Tạm giữ tranh chấp';
      case 'dispute_release':
        return 'Giải phóng tranh chấp';
      case 'dispute_refund':
        return 'Hoàn tiền tranh chấp';
      default:
        return type;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lịch sử giao dịch</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : walletLogs && walletLogs.length > 0 ? (
          <div className="space-y-4">
            {walletLogs.map((log: any) => (
              <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium">{getTypeLabel(log.type)}</span>
                    {getStatusBadge(log.status)}
                  </div>
                  <p className="text-sm text-gray-600">{log.description}</p>
                  <p className="text-xs text-gray-500">
                    {formatDate(log.created_at)}
                    {log.release_date && log.status === 'pending' && (
                      <span className="ml-2">
                        • Sẽ được giải phóng {formatDistanceToNow(new Date(log.release_date), { 
                          addSuffix: true, 
                          locale: vi 
                        })}
                      </span>
                    )}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">+{formatPI(Number(log.pi_amount))}</p>
                  <p className="text-xs text-gray-500">{formatVND(log.vnd_amount)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Chưa có giao dịch nào</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionHistory;
