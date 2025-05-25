
import { useEffect } from 'react';
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
                console.log('Fetched profile:', userProfile);
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
          isInitialized = true;
        }
      } catch (error) {
        console.error('AuthProvider: Auth initialization failed:', error);
        if (mounted) {
          setLoading(false);
          setProfileLoading(false);
          isInitialized = true;
        }
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('AuthProvider: Auth state changed:', event, newSession ? 'Session exists' : 'No session');
        
        if (!mounted) return;

        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        if (event === 'SIGNED_IN' && newSession?.user && isOnline) {
          console.log('AuthProvider: User signed in, fetching profile...');
          setProfileLoading(true);
          
          setTimeout(async () => {
            try {
              const userProfile = await fetchProfile(newSession.user.id);
              if (userProfile && mounted) {
                console.log('AuthProvider: Profile fetched after sign in:', userProfile.role);
                console.log('Fetched profile:', userProfile);
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
        
        if (isInitialized) {
          setLoading(false);
        }
      }
    );

    initializeAuth();

    return () => {
      console.log('AuthProvider: Cleaning up...');
      mounted = false;
      subscription.unsubscribe();
    };
  }, [isOnline, setSession, setUser, setProfile, setLoading, setProfileLoading, fetchProfile]);
};
