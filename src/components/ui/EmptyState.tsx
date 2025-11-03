import { LucideIcon, Package } from "lucide-react";
import { ReactNode } from "react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

export const EmptyState = ({ 
  icon: Icon = Package,
  title,
  description,
  action,
  className = ''
}: EmptyStateProps) => {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}>
      <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
        <Icon className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground text-center mb-6 max-w-md">
        {description}
      </p>
      {action}
    </div>
  );
};
