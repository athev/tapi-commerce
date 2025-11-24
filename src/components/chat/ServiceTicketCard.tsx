import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, DollarSign, CheckCircle2, AlertCircle } from "lucide-react";
import { formatPrice } from "@/utils/orderUtils";

interface ServiceTicket {
  id: string;
  title: string;
  status: string;
  quoted_price?: number;
  quoted_at?: string;
  accepted_at?: string;
  completed_at?: string;
  description: string;
}

interface ServiceTicketCardProps {
  ticket: ServiceTicket;
  userRole: 'buyer' | 'seller';
  onQuote?: () => void;
  onAccept?: () => void;
  onComplete?: () => void;
}

const statusConfig = {
  pending: { label: 'Chờ báo giá', color: 'bg-yellow-500', icon: Clock },
  quoted: { label: 'Đã báo giá', color: 'bg-blue-500', icon: DollarSign },
  accepted: { label: 'Đã chấp nhận', color: 'bg-purple-500', icon: CheckCircle2 },
  in_progress: { label: 'Đang xử lý', color: 'bg-orange-500', icon: Clock },
  completed: { label: 'Hoàn thành', color: 'bg-green-500', icon: CheckCircle2 },
  cancelled: { label: 'Đã hủy', color: 'bg-gray-500', icon: AlertCircle },
  disputed: { label: 'Tranh chấp', color: 'bg-red-500', icon: AlertCircle }
};

const ServiceTicketCard = ({ ticket, userRole, onQuote, onAccept, onComplete }: ServiceTicketCardProps) => {
  const config = statusConfig[ticket.status as keyof typeof statusConfig];
  const Icon = config?.icon || Clock;

  return (
    <Card className="mb-4 border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-sm font-medium">
              Phiếu yêu cầu #{ticket.id.slice(0, 8)}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">{ticket.title}</p>
          </div>
          <Badge className={`${config?.color} text-white`}>
            <Icon className="h-3 w-3 mr-1" />
            {config?.label}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{ticket.description}</p>
        
        {ticket.quoted_price && (
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <span className="text-sm font-medium">Báo giá:</span>
            <span className="text-lg font-bold text-primary">
              {formatPrice(ticket.quoted_price)}
            </span>
          </div>
        )}

        {/* Action buttons based on status and role */}
        <div className="flex gap-2 pt-2">
          {userRole === 'seller' && ticket.status === 'pending' && onQuote && (
            <Button onClick={onQuote} size="sm" className="w-full">
              <DollarSign className="h-4 w-4 mr-1" />
              Báo giá
            </Button>
          )}
          
          {userRole === 'buyer' && ticket.status === 'quoted' && onAccept && (
            <Button onClick={onAccept} size="sm" className="w-full">
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Chấp nhận báo giá
            </Button>
          )}
          
          {userRole === 'buyer' && ticket.status === 'in_progress' && onComplete && (
            <Button onClick={onComplete} size="sm" className="w-full" variant="default">
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Xác nhận hoàn thành
            </Button>
          )}
        </div>

        {/* Timeline */}
        {ticket.status !== 'pending' && (
          <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
            {ticket.quoted_at && (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3 w-3 text-blue-500" />
                <span>Đã báo giá: {new Date(ticket.quoted_at).toLocaleString('vi-VN')}</span>
              </div>
            )}
            {ticket.accepted_at && (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3 w-3 text-purple-500" />
                <span>Đã chấp nhận: {new Date(ticket.accepted_at).toLocaleString('vi-VN')}</span>
              </div>
            )}
            {ticket.completed_at && (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3 w-3 text-green-500" />
                <span>Hoàn thành: {new Date(ticket.completed_at).toLocaleString('vi-VN')}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ServiceTicketCard;
