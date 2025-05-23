
import { Wifi, WifiOff } from "lucide-react";

interface ConnectionStatusProps {
  isOnline: boolean;
}

const ConnectionStatus = ({ isOnline }: ConnectionStatusProps) => {
  return (
    <div className="flex items-center justify-center gap-1">
      {isOnline ? (
        <>
          <Wifi className="h-3.5 w-3.5 text-green-500" /> 
          <span className="text-green-600">Trạng thái kết nối: Online</span>
        </>
      ) : (
        <>
          <WifiOff className="h-3.5 w-3.5 text-red-500" /> 
          <span className="text-red-600">Trạng thái kết nối: Offline</span>
        </>
      )}
    </div>
  );
};

export default ConnectionStatus;
