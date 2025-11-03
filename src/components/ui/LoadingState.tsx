import { Loader2 } from "lucide-react";
import { Skeleton } from "./skeleton";

interface LoadingStateProps {
  type?: 'spinner' | 'skeleton';
  message?: string;
  className?: string;
}

export const LoadingState = ({ 
  type = 'spinner', 
  message = 'Đang tải...',
  className = ''
}: LoadingStateProps) => {
  if (type === 'skeleton') {
    return (
      <div className={`space-y-4 ${className}`}>
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }
  
  return (
    <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
      <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
};
