import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Clock, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { getWarrantyStatus, getWarrantyPeriodText } from "@/utils/warrantyUtils";

interface WarrantyStatusCardProps {
  order: {
    id: string;
    payment_verified_at?: string | null;
    status: string;
  };
  product: {
    warranty_period?: string | null;
  };
  onClaimWarranty?: () => void;
  compact?: boolean;
}

const WarrantyStatusCard = ({ 
  order, 
  product, 
  onClaimWarranty,
  compact = false 
}: WarrantyStatusCardProps) => {
  // Only show warranty for paid orders
  if (order.status !== 'paid' || !product?.warranty_period || product.warranty_period === 'none') {
    return null;
  }

  const warrantyStatus = getWarrantyStatus(order.payment_verified_at, product.warranty_period);
  
  if (!warrantyStatus.hasWarranty) return null;

  const getStatusIcon = () => {
    if (warrantyStatus.isLifetime) return <Shield className="h-4 w-4" />;
    if (warrantyStatus.isActive) {
      if (warrantyStatus.statusColor === 'yellow') return <AlertTriangle className="h-4 w-4" />;
      return <CheckCircle className="h-4 w-4" />;
    }
    return <XCircle className="h-4 w-4" />;
  };

  const getStatusColorClasses = () => {
    switch (warrantyStatus.statusColor) {
      case 'green':
        return 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400';
      case 'yellow':
        return 'bg-yellow-50 border-yellow-200 text-yellow-700 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-400';
      case 'red':
        return 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400';
      default:
        return 'bg-muted border-border text-muted-foreground';
    }
  };

  const getBadgeVariant = () => {
    switch (warrantyStatus.statusColor) {
      case 'green':
        return 'default';
      case 'yellow':
        return 'secondary';
      case 'red':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (compact) {
    return (
      <div className={`flex items-center justify-between p-2 rounded-lg border ${getStatusColorClasses()}`}>
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className="text-xs font-medium">{warrantyStatus.statusText}</span>
        </div>
        {warrantyStatus.isActive && onClaimWarranty && (
          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={onClaimWarranty}>
            Yêu cầu BH
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card className={`border ${getStatusColorClasses()}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-full ${
              warrantyStatus.statusColor === 'green' ? 'bg-green-100 dark:bg-green-900/40' :
              warrantyStatus.statusColor === 'yellow' ? 'bg-yellow-100 dark:bg-yellow-900/40' :
              warrantyStatus.statusColor === 'red' ? 'bg-red-100 dark:bg-red-900/40' :
              'bg-muted'
            }`}>
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-sm">Bảo hành sản phẩm</h4>
                <Badge variant={getBadgeVariant()} className="text-xs">
                  {getWarrantyPeriodText(product.warranty_period)}
                </Badge>
              </div>
              <p className="text-sm">{warrantyStatus.statusText}</p>
              {warrantyStatus.isActive && !warrantyStatus.isLifetime && warrantyStatus.expiryDate && (
                <p className="text-xs mt-1 opacity-80">
                  Hết hạn: {warrantyStatus.expiryDate.toLocaleDateString('vi-VN')}
                </p>
              )}
            </div>
          </div>
          
          {warrantyStatus.isActive && onClaimWarranty && (
            <Button 
              size="sm" 
              variant={warrantyStatus.statusColor === 'yellow' ? 'default' : 'outline'}
              onClick={onClaimWarranty}
            >
              <Clock className="h-4 w-4 mr-1" />
              Yêu cầu bảo hành
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WarrantyStatusCard;
