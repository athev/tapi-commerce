
import { useState, useMemo, useCallback } from 'react';
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

  // Memoize the callbacks to prevent unnecessary re-renders
  const memoizedSetSession = useCallback(setSession, [setSession]);
  const memoizedSetUser = useCallback(setUser, [setUser]);
  const memoizedSetProfile = useCallback(setProfile, [setProfile]);
  const memoizedSetLoading = useCallback(setLoading, [setLoading]);
  const memoizedSetProfileLoading = useCallback(setProfileLoading, []);
  const memoizedFetchProfile = useCallback(fetchProfile, [fetchProfile]);

  // Initialize auth session and set up listeners - this should only run once
  useAuthInitialization({
    isOnline,
    setSession: memoizedSetSession,
    setUser: memoizedSetUser,
    setProfile: memoizedSetProfile,
    setLoading: memoizedSetLoading,
    setProfileLoading: memoizedSetProfileLoading,
    fetchProfile: memoizedFetchProfile,
  });

  // Debug logging for auth state - throttle this to prevent spam
  useAuthDebugLogging({
    user,
    profile,
    session,
    loading,
    profileLoading,
    isOnline,
  });

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
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
  }), [session, user, profile, loading, profileLoading, signIn, signUp, signOut, refreshProfile, isOnline]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
