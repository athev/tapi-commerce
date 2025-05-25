
import { useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { UserProfile } from '@/lib/supabase';

interface UseAuthDebugLoggingProps {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  profileLoading: boolean;
  isOnline: boolean;
}

export const useAuthDebugLogging = ({
  user,
  profile,
  session,
  loading,
  profileLoading,
  isOnline,
}: UseAuthDebugLoggingProps) => {
  useEffect(() => {
    console.log('AuthProvider state:', { 
      hasUser: !!user, 
      hasProfile: !!profile, 
      hasSession: !!session, 
      loading, 
      profileLoading,
      isOnline,
      profileRole: profile?.role 
    });
  }, [user, profile, session, loading, profileLoading, isOnline]);
};
