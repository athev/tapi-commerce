
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import WithdrawalForm from "./WithdrawalForm";

interface WithdrawalSectionProps {
  availablePI: number;
  onWithdrawalSuccess: () => void;
}

const formatPI = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { 
    minimumFractionDigits: 0,
    maximumFractionDigits: 2 
  }).format(amount) + " PI";
};

const WithdrawalSection = ({ availablePI, onWithdrawalSuccess }: WithdrawalSectionProps) => {
  const [showForm, setShowForm] = useState(false);

  return (
    <>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Rút tiền</h3>
              <p className="text-muted-foreground">
                Bạn có thể rút {formatPI(availablePI)} về tài khoản ngân hàng
              </p>
            </div>
            <Button 
              disabled={availablePI < 100}
              onClick={() => setShowForm(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Rút tiền
            </Button>
          </div>
        </CardContent>
      </Card>

      <WithdrawalForm
        open={showForm}
        onOpenChange={setShowForm}
        availablePI={availablePI}
        onSuccess={onWithdrawalSuccess}
      />
    </>
  );
};

export default WithdrawalSection;
