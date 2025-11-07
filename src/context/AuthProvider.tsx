
import { ReactNode } from 'react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useAuthInitialization } from '@/hooks/useAuthInitialization';
import { useAuthDebugLogging } from '@/hooks/useAuthDebugLogging';
import { AuthContext } from './AuthContext';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const isOnline = useNetworkStatus();
  
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
    signInWithGoogle,
    refreshProfile,
    fetchProfile
  } = useSupabaseAuth(isOnline);

  const { profileLoading } = useAuthInitialization(
    isOnline,
    setSession,
    setUser,
    setProfile,
    setLoading,
    fetchProfile
  );

  useAuthDebugLogging(user, profile, session, loading, profileLoading, isOnline);

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
      signInWithGoogle,
      refreshProfile,
      isOnline,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
