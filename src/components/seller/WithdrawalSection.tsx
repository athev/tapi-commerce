
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface WithdrawalSectionProps {
  availablePI: number;
}

const formatPI = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { 
    minimumFractionDigits: 0,
    maximumFractionDigits: 2 
  }).format(amount) + " PI";
};

const WithdrawalSection = ({ availablePI }: WithdrawalSectionProps) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Rút tiền</h3>
            <p className="text-gray-500">Bạn có thể rút {formatPI(availablePI)} về tài khoản ngân hàng</p>
          </div>
          <Button 
            disabled={availablePI <= 0}
            className="bg-green-600 hover:bg-green-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Rút tiền
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WithdrawalSection;
