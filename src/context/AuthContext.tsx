
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

  // Initialize user session with better error handling and timeout
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

        // Add timeout to prevent infinite loading
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Session initialization timeout')), 8000);
        });

        const sessionPromise = supabase.auth.getSession();
        
        const { data: { session: currentSession }, error } = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]) as any;
        
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
          try {
            // Add timeout for profile fetch and better error handling
            const profileTimeoutPromise = new Promise((_, reject) => {
              setTimeout(() => reject(new Error('Profile fetch timeout')), 3000);
            });
            
            const profilePromise = fetchProfile(currentSession.user.id);
            const userProfile = await Promise.race([profilePromise, profileTimeoutPromise]);
            
            if (userProfile) {
              console.log('Profile fetched successfully');
            } else {
              console.log('No profile found for user - will use email fallback');
            }
          } catch (profileError: any) {
            console.error('Profile fetch failed or timed out:', profileError);
            
            // Log specific error types for debugging
            if (profileError.message?.includes('INSUFFICIENT_RESOURCES')) {
              console.error('Supabase rate limit or resource issue detected');
            }
            
            // Don't block loading for profile fetch failures - user can still use the app
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
          
          // Only fetch profile for specific events to reduce API calls
          if (newSession?.user && (event === 'SIGNED_IN' || event === 'USER_UPDATED')) {
            console.log('Fetching profile for auth event:', event);
            try {
              // Add timeout and better error handling
              const profileTimeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Profile fetch timeout')), 3000);
              });
              
              const profilePromise = fetchProfile(newSession.user.id);
              const userProfile = await Promise.race([profilePromise, profileTimeoutPromise]);
              
              if (userProfile) {
                console.log('Profile updated successfully');
              }
            } catch (profileError: any) {
              console.error('Profile fetch failed or timed out:', profileError);
              
              if (profileError.message?.includes('INSUFFICIENT_RESOURCES')) {
                console.error('Supabase rate limit detected - profile will use fallback');
              }
            }
          }
        } catch (error) {
          console.error('Error in auth state change:', error);
        } finally {
          // Ensure loading is always set to false
          if (loading) {
            setLoading(false);
          }
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile, setSession, setUser, setLoading, loading]);

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
