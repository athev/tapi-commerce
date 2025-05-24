
import { useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { UserProfile } from '@/lib/supabase';
import { useUserProfile } from './useUserProfile';
import { useAuthOperations } from './useAuthOperations';
import { useSignUp } from './useSignUp';

/**
 * Hook for Supabase authentication methods
 */
export const useSupabaseAuth = (isOnline: boolean) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Use the profile management hook
  const { profile, setProfile, fetchProfile, refreshProfile } = useUserProfile();

  // Use the authentication operations hook
  const { signIn, signOut } = useAuthOperations(fetchProfile, setProfile);

  // Use the sign up hook
  const { signUp } = useSignUp();

  return {
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
    refreshProfile: () => refreshProfile(user),
    fetchProfile
  };
};
