
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

/**
 * Hook to monitor network status with toast notifications
 */
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success("Kết nối internet đã được khôi phục", { id: "network-status" });
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      toast.error("Mất kết nối internet. Một số chức năng có thể không hoạt động.", { id: "network-status" });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check initial state
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};
