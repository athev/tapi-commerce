
import { Wifi, WifiOff } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ConnectionStatusProps {
  isOnline: boolean;
}

const ConnectionStatus = ({ isOnline }: ConnectionStatusProps) => {
  if (isOnline) {
    return null; // Don't show anything when online
  }

  return (
    <Alert variant="warning" className="mb-4">
      <WifiOff className="h-4 w-4" />
      <AlertTitle>Không có kết nối internet</AlertTitle>
      <AlertDescription>
        Vui lòng kiểm tra kết nối mạng của bạn trước khi tiếp tục.
      </AlertDescription>
    </Alert>
  );
};

export default ConnectionStatus;
