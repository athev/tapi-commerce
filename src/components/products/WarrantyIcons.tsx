import { Truck, RefreshCw, Shield } from 'lucide-react';

const WarrantyIcons = () => {
  return (
    <div className="grid grid-cols-3 gap-3 py-3 text-sm border-y">
      <div className="flex flex-col items-center text-center gap-1.5">
        <Truck className="h-5 w-5 text-blue-600" />
        <span className="text-xs text-muted-foreground leading-tight">
          Giao ngay lập tức
        </span>
      </div>
      <div className="flex flex-col items-center text-center gap-1.5">
        <RefreshCw className="h-5 w-5 text-green-600" />
        <span className="text-xs text-muted-foreground leading-tight">
          Hoàn tiền 100%
        </span>
      </div>
      <div className="flex flex-col items-center text-center gap-1.5">
        <Shield className="h-5 w-5 text-purple-600" />
        <span className="text-xs text-muted-foreground leading-tight">
          Bảo hành 3 tháng
        </span>
      </div>
    </div>
  );
};

export default WarrantyIcons;
