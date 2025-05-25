
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
  useEffect(() => {
    console.log('AuthProvider: Initializing auth session...');
    
    let mounted = true;
    let isInitialized = false;

    const initializeAuth = async () => {
      if (isInitialized) {
        console.log('AuthProvider: Already initialized, skipping...');
        return;
      }
      
      try {
        console.log('AuthProvider: Getting initial session...');
        
        // Get initial session
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('AuthProvider: Error getting initial session:', error);
          if (mounted) setLoading(false);
          return;
        }

        console.log('AuthProvider: Initial session:', initialSession ? 'Found' : 'None');
        
        if (mounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          
          // Fetch profile if user exists and we're online
          if (initialSession?.user && isOnline) {
            console.log('AuthProvider: Fetching profile for initial session...');
            try {
              const userProfile = await fetchProfile(initialSession.user.id);
              if (userProfile && mounted) {
                console.log('AuthProvider: Profile loaded successfully:', userProfile.role);
                setProfile(userProfile);
              }
            } catch (profileError) {
              console.error('AuthProvider: Profile fetch failed:', profileError);
              // Continue without profile - don't block auth
            }
          }
          
          setLoading(false);
          isInitialized = true;
        }
      } catch (error) {
        console.error('AuthProvider: Auth initialization failed:', error);
        if (mounted) {
          setLoading(false);
          isInitialized = true;
        }
      }
    };

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('AuthProvider: Auth state changed:', event, newSession ? 'Session exists' : 'No session');
        
        if (!mounted) return;

        // Always update session and user state
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        // Handle different auth events
        if (event === 'SIGNED_IN' && newSession?.user && isOnline) {
          console.log('AuthProvider: User signed in, fetching profile...');
          try {
            const userProfile = await fetchProfile(newSession.user.id);
            if (userProfile && mounted) {
              console.log('AuthProvider: Profile fetched after sign in:', userProfile.role);
              setProfile(userProfile);
            }
          } catch (profileError) {
            console.error('AuthProvider: Profile fetch failed on sign in:', profileError);
            // Don't block - user can still use the app
          }
        }
        
        // Clear profile on sign out
        if (event === 'SIGNED_OUT') {
          console.log('AuthProvider: User signed out, clearing profile');
          setProfile(null);
        }
        
        // Mark as no longer loading after any auth state change
        if (isInitialized) {
          setLoading(false);
        }
      }
    );

    // Initialize auth only once
    initializeAuth();

    return () => {
      console.log('AuthProvider: Cleaning up...');
      mounted = false;
      subscription.unsubscribe();
    };
  }, [isOnline, setSession, setUser, setProfile, setLoading, fetchProfile]);

  // Debug logging for auth state
  useEffect(() => {
    console.log('AuthProvider state:', { 
      hasUser: !!user, 
      hasProfile: !!profile, 
      hasSession: !!session, 
      loading, 
      isOnline 
    });
  }, [user, profile, session, loading, isOnline]);

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
