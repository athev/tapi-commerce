
import { useEffect, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { UserProfile } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';

interface UseAuthInitializationProps {
  isOnline: boolean;
  setSession: (session: Session | null) => void;
  setUser: (user: User | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  setProfileLoading: (loading: boolean) => void;
  fetchProfile: (userId: string) => Promise<UserProfile | null>;
}

export const useAuthInitialization = ({
  isOnline,
  setSession,
  setUser,
  setProfile,
  setLoading,
  setProfileLoading,
  fetchProfile,
}: UseAuthInitializationProps) => {
  const isInitialized = useRef(false);
  const subscriptionRef = useRef<any>(null);

  useEffect(() => {
    // Prevent multiple initializations
    if (isInitialized.current) {
      console.log('AuthProvider: Already initialized, skipping...');
      return;
    }

    console.log('AuthProvider: Initializing auth session...');
    
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('AuthProvider: Getting initial session...');
        
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('AuthProvider: Error getting initial session:', error);
          if (mounted) {
            setLoading(false);
            setProfileLoading(false);
          }
          return;
        }

        console.log('AuthProvider: Initial session:', initialSession ? 'Found' : 'None');
        
        if (mounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          
          if (initialSession?.user && isOnline) {
            console.log('AuthProvider: Fetching profile for initial session...');
            setProfileLoading(true);
            try {
              const userProfile = await fetchProfile(initialSession.user.id);
              if (userProfile && mounted) {
                console.log('AuthProvider: Profile loaded successfully:', userProfile.role);
                setProfile(userProfile);
              } else {
                console.log('AuthProvider: No profile found for user');
              }
            } catch (profileError) {
              console.error('AuthProvider: Profile fetch failed:', profileError);
            } finally {
              if (mounted) setProfileLoading(false);
            }
          } else {
            setProfileLoading(false);
          }
          
          setLoading(false);
        }
      } catch (error) {
        console.error('AuthProvider: Auth initialization failed:', error);
        if (mounted) {
          setLoading(false);
          setProfileLoading(false);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('AuthProvider: Auth state changed:', event, newSession ? 'Session exists' : 'No session');
        
        if (!mounted) return;

        // Only update session state, don't refetch profile on every change
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        if (event === 'SIGNED_IN' && newSession?.user && isOnline) {
          console.log('AuthProvider: User signed in, fetching profile...');
          setProfileLoading(true);
          
          // Small delay to prevent race conditions
          setTimeout(async () => {
            if (!mounted) return;
            
            try {
              const userProfile = await fetchProfile(newSession.user.id);
              if (userProfile && mounted) {
                console.log('AuthProvider: Profile fetched after sign in:', userProfile.role);
                setProfile(userProfile);
              } else {
                console.log('AuthProvider: No profile found after sign in');
              }
            } catch (profileError) {
              console.error('AuthProvider: Profile fetch failed on sign in:', profileError);
            } finally {
              if (mounted) setProfileLoading(false);
            }
          }, 100);
        }
        
        if (event === 'SIGNED_OUT') {
          console.log('AuthProvider: User signed out, clearing profile');
          setProfile(null);
          setProfileLoading(false);
        }
        
        setLoading(false);
      }
    );

    subscriptionRef.current = subscription;
    initializeAuth();
    isInitialized.current = true;

    return () => {
      console.log('AuthProvider: Cleaning up...');
      mounted = false;
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
      // Don't reset isInitialized on cleanup to prevent re-initialization
    };
  }, []); // Empty dependency array to run only once
};
