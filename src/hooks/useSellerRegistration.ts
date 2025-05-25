
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSellerProfileOperations } from './useSellerProfileOperations';
import { useSellerRegistrationNotifications } from './useSellerRegistrationNotifications';

export const useSellerRegistration = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const { user, refreshProfile } = useAuth();
  const { updateUserRoleToSeller } = useSellerProfileOperations();
  const { 
    showSuccessNotification, 
    showErrorNotification, 
    showAuthErrorNotification 
  } = useSellerRegistrationNotifications();

  const registerAsSeller = async () => {
    if (!user) {
      showAuthErrorNotification();
      return false;
    }

    setIsRegistering(true);
    
    try {
      await updateUserRoleToSeller(user.id);
      
      // Refresh the profile in the auth context
      await refreshProfile();
      
      showSuccessNotification();
      
      return true;
    } catch (error: any) {
      showErrorNotification(error);
      return false;
    } finally {
      setIsRegistering(false);
    }
  };

  return {
    isRegistering,
    registerAsSeller
  };
};
