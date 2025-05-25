
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
                console.log('Fetched profile:', userProfile);
                setProfile(userProfile);
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
          try {
            const userProfile = await fetchProfile(newSession.user.id);
            if (userProfile && mounted) {
              console.log('AuthProvider: Profile fetched after sign in:', userProfile.role);
              console.log('Fetched profile:', userProfile);
              setProfile(userProfile);
            }
          } catch (profileError) {
            console.error('AuthProvider: Profile fetch failed on sign in:', profileError);
          } finally {
            if (mounted) setProfileLoading(false);
          }
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
  }, [isOnline, setSession, setUser, setProfile, setLoading, fetchProfile]);

  return { profileLoading };
};
