
import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/lib/supabase';

export const useUserProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Fetch user profile from profiles table
  const fetchProfile = async (userId: string) => {
    if (!navigator.onLine) {
      console.log("useUserProfile: Offline mode, cannot fetch profile");
      return null;
    }

    try {
      console.log('useUserProfile: Fetching profile for user:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('useUserProfile: Error fetching profile:', error);
        
        // If profile doesn't exist, it might be a new user
        if (error.code === 'PGRST116') {
          console.log('useUserProfile: Profile not found, might be new user');
          return null;
        }
        
        throw error;
      }
      
      console.log('useUserProfile: Profile fetched successfully:', data);
      console.log('Fetched profile:', data);
      
      // Set the profile in state immediately after fetching
      const userProfile = data as UserProfile;
      setProfile(userProfile);
      
      return userProfile;
    } catch (error) {
      console.error('useUserProfile: Error in fetchProfile:', error);
      return null;
    }
  };

  // Refresh profile data
  const refreshProfile = async (user: User | null) => {
    if (user && navigator.onLine) {
      console.log('useUserProfile: Refreshing profile for user:', user.id);
      const userProfile = await fetchProfile(user.id);
      if (userProfile) {
        setProfile(userProfile);
        console.log('useUserProfile: Profile set in state:', userProfile);
      }
    } else {
      console.log('useUserProfile: Cannot refresh profile - user or connection unavailable');
    }
  };

  return {
    profile,
    setProfile,
    fetchProfile,
    refreshProfile
  };
};
