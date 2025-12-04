import { Badge } from "@/components/ui/badge";
import { Shield } from "lucide-react";
import { getWarrantyPeriodText } from "@/utils/warrantyUtils";

interface WarrantyBadgeProps {
  warrantyPeriod: string | null | undefined;
  size?: 'sm' | 'md';
}

const WarrantyBadge = ({ warrantyPeriod, size = 'sm' }: WarrantyBadgeProps) => {
  if (!warrantyPeriod || warrantyPeriod === 'none') return null;

  const periodText = getWarrantyPeriodText(warrantyPeriod);

  if (size === 'sm') {
    return (
      <Badge 
        variant="secondary" 
        className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-[10px] px-1.5 py-0.5"
      >
        🛡️ BH {periodText}
      </Badge>
    );
  }

  return (
    <Badge 
      variant="secondary" 
      className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 flex items-center gap-1"
    >
      <Shield className="h-3 w-3" />
      Bảo hành {periodText}
    </Badge>
  );
};

export default WarrantyBadge;
