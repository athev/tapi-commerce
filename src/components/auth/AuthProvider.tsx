
import { useState } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { AuthProviderProps } from '@/context/types/AuthTypes';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useAuthInitialization } from '@/hooks/useAuthInitialization';
import { useAuthDebugLogging } from '@/hooks/useAuthDebugLogging';

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const isOnline = useNetworkStatus();
  const [profileLoading, setProfileLoading] = useState(true);
  
  const {
    session,
    setSession,
    user,
    setUser,
    profile,
    setProfile,
    loading,
    setLoading,
    signIn,
    signUp,
    signOut,
    refreshProfile,
    fetchProfile
  } = useSupabaseAuth(isOnline);

  // Initialize auth session and set up listeners
  useAuthInitialization({
    isOnline,
    setSession,
    setUser,
    setProfile,
    setLoading,
    setProfileLoading,
    fetchProfile,
  });

  // Debug logging for auth state
  useAuthDebugLogging({
    user,
    profile,
    session,
    loading,
    profileLoading,
    isOnline,
  });

  return (
    <AuthContext.Provider value={{
      session,
      user,
      profile,
      loading,
      profileLoading,
      signIn,
      signUp,
      signOut,
      refreshProfile,
      isOnline,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
