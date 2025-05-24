
import NetworkErrorAlert from "@/components/auth/NetworkErrorAlert";
import ConnectionStatus from "@/components/auth/ConnectionStatus";

interface RegisterNetworkStatusProps {
  networkError: boolean;
  onRetry: () => void;
}

const RegisterNetworkStatus = ({ networkError, onRetry }: RegisterNetworkStatusProps) => {
  return (
    <>
      {networkError && <NetworkErrorAlert onRetry={onRetry} />}
      
      <div className="mt-4 text-center text-sm text-gray-500">
        <ConnectionStatus isOnline={navigator.onLine} />
      </div>
    </>
  );
};

export default RegisterNetworkStatus;
