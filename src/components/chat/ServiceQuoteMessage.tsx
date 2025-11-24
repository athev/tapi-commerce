import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, Clock, FileText, CheckCircle2, XCircle } from "lucide-react";
import { formatPrice } from "@/utils/orderUtils";

interface ServiceQuoteData {
  quoted_price: number;
  estimated_days: number;
  notes?: string;
}

interface ServiceQuoteMessageProps {
  quoteData: ServiceQuoteData;
  userRole: 'buyer' | 'seller';
  ticketStatus: string;
  onAccept?: () => void;
  onReject?: () => void;
}

const ServiceQuoteMessage = ({ 
  quoteData, 
  userRole, 
  ticketStatus,
  onAccept, 
  onReject 
}: ServiceQuoteMessageProps) => {
  const canAccept = userRole === 'buyer' && ticketStatus === 'quoted';

  return (
    <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-semibold">
          <DollarSign className="h-5 w-5" />
          <span>Báo giá dịch vụ</span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 bg-background rounded-lg">
            <span className="text-sm font-medium">Giá dịch vụ:</span>
            <span className="text-xl font-bold text-primary">
              {formatPrice(quoteData.quoted_price)}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Thời gian ước tính: {quoteData.estimated_days} ngày</span>
          </div>

          {quoteData.notes && (
            <div className="flex items-start gap-2 text-sm">
              <FileText className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div className="flex-1">
                <p className="font-medium mb-1">Ghi chú:</p>
                <p className="text-muted-foreground whitespace-pre-wrap">{quoteData.notes}</p>
              </div>
            </div>
          )}
        </div>

        {canAccept && onAccept && (
          <div className="flex gap-2 pt-2 border-t">
            <Button onClick={onAccept} size="sm" className="flex-1">
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Chấp nhận báo giá
            </Button>
            {onReject && (
              <Button onClick={onReject} size="sm" variant="outline" className="flex-1">
                <XCircle className="h-4 w-4 mr-1" />
                Thương lượng
              </Button>
            )}
          </div>
        )}

        {ticketStatus === 'accepted' && (
          <div className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1 pt-2 border-t">
            <CheckCircle2 className="h-3 w-3" />
            <span>Đã chấp nhận báo giá - Vui lòng thanh toán để bắt đầu</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ServiceQuoteMessage;
