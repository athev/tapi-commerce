
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { UserProfile } from '@/lib/supabase';

export const useAuthInitialization = (
  isOnline: boolean,
  setSession: (session: Session | null) => void,
  setUser: (user: User | null) => void,
  setProfile: (profile: UserProfile | null) => void,
  setLoading: (loading: boolean) => void,
  fetchProfile: (userId: string) => Promise<UserProfile | null>
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
      (event, newSession) => {
        console.log('AuthProvider: Auth state changed:', event, newSession ? 'Session exists' : 'No session');
        
        if (!mounted) return;

        // Synchronous state updates only
        setSession(newSession);
        setUser(newSession?.user ?? null);

        // Handle sign out
        if (event === 'SIGNED_OUT') {
          console.log('AuthProvider: User signed out, clearing all state');
          setProfile(null);
          setProfileLoading(false);
          setLoading(false);
          return;
        }
        
        // Handle sign in - defer profile fetch
        if (event === 'SIGNED_IN' && newSession?.user && isOnline) {
          console.log('AuthProvider: User signed in, scheduling profile fetch...');
          setProfileLoading(true);
          
          setTimeout(async () => {
            if (!mounted) return;
            
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
          }, 0);
        } else if (!newSession?.user) {
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
  }, [isOnline, setSession, setUser, setProfile, setLoading, fetchProfile]);

  return { profileLoading };
};
