
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, WifiOff, RefreshCw } from "lucide-react";

interface NetworkErrorAlertProps {
  onRetry: () => void;
}

const NetworkErrorAlert = ({ onRetry }: NetworkErrorAlertProps) => {
  return (
    <Alert variant="warning" className="mb-4 animate-pulse">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Lỗi kết nối</AlertTitle>
      <AlertDescription className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <WifiOff className="h-4 w-4" /> 
          Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet và thử lại sau.
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-2 w-full flex items-center justify-center gap-2"
          onClick={onRetry}
        >
          <RefreshCw className="h-4 w-4" />
          Thử lại kết nối
        </Button>
      </AlertDescription>
    </Alert>
  );
};

export default NetworkErrorAlert;
