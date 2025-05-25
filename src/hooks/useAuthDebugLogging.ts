
import { useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { UserProfile } from '@/lib/supabase';

export const useAuthDebugLogging = (
  user: User | null,
  profile: UserProfile | null,
  session: Session | null,
  loading: boolean,
  profileLoading: boolean,
  isOnline: boolean
) => {
  useEffect(() => {
    console.log('AuthProvider state:', { 
      hasUser: !!user, 
      hasProfile: !!profile, 
      hasSession: !!session, 
      loading, 
      profileLoading,
      isOnline 
    });
  }, [user, profile, session, loading, profileLoading, isOnline]);
};
