
import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';

export const useUser = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useUser must be used within an AuthProvider');
  }
  
  return {
    user: context.user,
    session: context.session,
    isLoading: context.loading,
    profile: context.profile
  };
};
