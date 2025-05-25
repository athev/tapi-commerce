
import { createContext, ReactNode } from 'react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useAuthInitialization } from '@/hooks/useAuthInitialization';
import { useAuthDebugLogging } from '@/hooks/useAuthDebugLogging';
import { AuthContextType } from '@/context/AuthContextTypes';

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  loading: true,
  profileLoading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null, success: false }),
  signOut: async () => {},
  refreshProfile: async () => {},
  isOnline: true,
});

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
      refreshProfile,
      isOnline,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };
