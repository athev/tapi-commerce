
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

export const useAuthInitialization = (
  isOnline: boolean,
  setSession: ReturnType<typeof useSupabaseAuth>['setSession'],
  setUser: ReturnType<typeof useSupabaseAuth>['setUser'],
  setProfile: ReturnType<typeof useSupabaseAuth>['setProfile'],
  setLoading: ReturnType<typeof useSupabaseAuth>['setLoading'],
  fetchProfile: ReturnType<typeof useSupabaseAuth>['fetchProfile']
) => {
  const [profileLoading, setProfileLoading] = useState(true);

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
                setProfile(userProfile);
              } else {
                console.log('AuthProvider: No profile found for user');
                setProfile(null);
              }
            } catch (profileError) {
              console.error('AuthProvider: Profile fetch failed:', profileError);
              setProfile(null);
            } finally {
              if (mounted) setProfileLoading(false);
            }
          } else {
            setProfile(null);
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
          setProfile(null);
          isInitialized = true;
        }
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('AuthProvider: Auth state changed:', event, newSession ? 'Session exists' : 'No session');
        
        if (!mounted) return;

        // Handle sign out immediately
        if (event === 'SIGNED_OUT') {
          console.log('AuthProvider: User signed out, clearing all state');
          setSession(null);
          setUser(null);
          setProfile(null);
          setProfileLoading(false);
          setLoading(false);
          return;
        }

        // Handle other events
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        // Only fetch profile on sign in, not on every auth state change
        if (event === 'SIGNED_IN' && newSession?.user && isOnline) {
          console.log('AuthProvider: User signed in, fetching profile...');
          setProfileLoading(true);
          
          try {
            const userProfile = await fetchProfile(newSession.user.id);
            if (userProfile && mounted) {
              console.log('AuthProvider: Profile fetched after sign in:', userProfile.role);
              setProfile(userProfile);
            } else {
              console.log('AuthProvider: No profile found after sign in');
              setProfile(null);
            }
          } catch (profileError) {
            console.error('AuthProvider: Profile fetch failed on sign in:', profileError);
            setProfile(null);
          } finally {
            if (mounted) setProfileLoading(false);
          }
        } else if (!newSession?.user) {
          // Clear profile if no user session
          setProfile(null);
          setProfileLoading(false);
        }
        
        if (isInitialized) {
          setLoading(false);
        }
      }
    );

    // Initialize auth after setting up the listener
    initializeAuth();

    return () => {
      console.log('AuthProvider: Cleaning up...');
      mounted = false;
      subscription.unsubscribe();
    };
  }, [isOnline]); // Only depend on isOnline, remove function dependencies

  return { profileLoading };
};
