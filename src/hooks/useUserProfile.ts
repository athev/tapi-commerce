
import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/lib/supabase';

export const useUserProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Fetch user profile from profiles table
  const fetchProfile = async (userId: string) => {
    if (!navigator.onLine) {
      console.log("Offline mode: Cannot fetch profile");
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      
      return data as UserProfile;
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      return null;
    }
  };

  // Refresh profile data
  const refreshProfile = async (user: User | null) => {
    if (user && navigator.onLine) {
      const userProfile = await fetchProfile(user.id);
      setProfile(userProfile);
    }
  };

  return {
    profile,
    setProfile,
    fetchProfile,
    refreshProfile
  };
};
