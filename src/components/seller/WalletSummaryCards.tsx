
import { Card, CardContent } from "@/components/ui/card";
import { Clock, CheckCircle, TrendingUp } from "lucide-react";

interface WalletSummaryCardsProps {
  wallet: {
    pending: number;
    available: number;
    total_earned: number;
  };
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

const WalletSummaryCards = ({ wallet }: WalletSummaryCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">PI Chờ xử lý</p>
              <p className="text-2xl font-bold text-yellow-600">{formatPI(Number(wallet.pending))}</p>
              <p className="text-xs text-gray-500">{formatVND(Number(wallet.pending) * 1000)}</p>
            </div>
            <div className="p-3 rounded-full bg-yellow-50">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">PI Có thể rút</p>
              <p className="text-2xl font-bold text-green-600">{formatPI(Number(wallet.available))}</p>
              <p className="text-xs text-gray-500">{formatVND(Number(wallet.available) * 1000)}</p>
            </div>
            <div className="p-3 rounded-full bg-green-50">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng thu nhập</p>
              <p className="text-2xl font-bold text-blue-600">{formatPI(Number(wallet.total_earned))}</p>
              <p className="text-xs text-gray-500">{formatVND(Number(wallet.total_earned) * 1000)}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-50">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WalletSummaryCards;
