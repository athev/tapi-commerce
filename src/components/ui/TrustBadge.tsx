import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TrustBadgeProps {
  icon?: string;
  text: string;
  variant?: 'success' | 'warning' | 'primary' | 'default';
}

export const TrustBadge = ({ icon, text, variant = 'default' }: TrustBadgeProps) => {
  const variants = {
    success: 'bg-[hsl(var(--success-bg))] text-[hsl(var(--success-text))]',
    warning: 'bg-[hsl(var(--warning-bg))] text-[hsl(var(--warning-text))]',
    primary: 'bg-primary/10 text-primary',
    default: 'bg-[hsl(var(--neutral-100))] text-[hsl(var(--neutral-600))]'
  };
  
  return (
    <Badge className={cn(
      'border-0 text-[10px] px-2 py-0.5 font-medium',
      variants[variant]
    )}>
      {icon && <span className="mr-1">{icon}</span>}
      {text}
    </Badge>
  );
};
