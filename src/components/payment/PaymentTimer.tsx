
import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";

interface PaymentTimerProps {
  timeLeft: number;
  formatTime: (seconds: number) => string;
}

const PaymentTimer = ({ timeLeft, formatTime }: PaymentTimerProps) => {
  return (
    <Card className="border-2 border-blue-200 bg-blue-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-center space-x-2">
          <Clock className="h-5 w-5 text-blue-600" />
          <span className="text-lg font-semibold text-blue-700">
            Thời gian còn lại: {formatTime(timeLeft)}
          </span>
        </div>
        <p className="text-center text-sm text-blue-600 mt-2">
          Vui lòng hoàn tất thanh toán trong thời gian trên
        </p>
      </CardContent>
    </Card>
  );
};

export default PaymentTimer;
