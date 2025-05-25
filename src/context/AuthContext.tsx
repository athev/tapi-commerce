
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

type AuthContextType = {
  session: ReturnType<typeof useSupabaseAuth>['session'];
  user: ReturnType<typeof useSupabaseAuth>['user'];
  profile: ReturnType<typeof useSupabaseAuth>['profile'];
  loading: boolean;
  signIn: ReturnType<typeof useSupabaseAuth>['signIn'];
  signUp: ReturnType<typeof useSupabaseAuth>['signUp'];
  signOut: ReturnType<typeof useSupabaseAuth>['signOut'];
  refreshProfile: ReturnType<typeof useSupabaseAuth>['refreshProfile'];
  isOnline: boolean;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  loading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null, success: false }),
  signOut: async () => {},
  refreshProfile: async () => {},
  isOnline: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const isOnline = useNetworkStatus();
  const {
    session,
    setSession,
    user,
    setUser,
    profile,
    loading,
    setLoading,
    signIn,
    signUp,
    signOut,
    refreshProfile,
    fetchProfile
  } = useSupabaseAuth(isOnline);

  // Initialize user session with better error handling
  useEffect(() => {
    const initSession = async () => {
      try {
        console.log('Initializing auth session...');
        
        // Check if we're online first
        if (!navigator.onLine) {
          console.log("Offline mode: Using cached session if available");
          setLoading(false);
          return;
        }

        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setLoading(false);
          return;
        }
        
        console.log('Session retrieved:', currentSession ? 'Found' : 'None');
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          console.log('Fetching user profile...');
          const userProfile = await fetchProfile(currentSession.user.id);
          if (userProfile) {
            console.log('Profile fetched successfully');
          }
        }
      } catch (error) {
        console.error('Error initializing session:', error);
      } finally {
        setLoading(false);
      }
    };

    initSession();

    // Listen for auth changes with better error handling
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        try {
          console.log('Auth state changed:', event, newSession ? 'Session exists' : 'No session');
          
          setSession(newSession);
          setUser(newSession?.user ?? null);
          
          if (newSession?.user && event !== 'TOKEN_REFRESHED') {
            console.log('Fetching profile for new session...');
            const userProfile = await fetchProfile(newSession.user.id);
            if (userProfile) {
              console.log('Profile updated successfully');
            }
          }
        } catch (error) {
          console.error('Error in auth state change:', error);
        } finally {
          setLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile, setSession, setUser, setLoading]);

  return (
    <AuthContext.Provider value={{
      session,
      user,
      profile,
      loading,
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
