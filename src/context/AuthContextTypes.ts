
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

export type AuthContextType = {
  session: ReturnType<typeof useSupabaseAuth>['session'];
  user: ReturnType<typeof useSupabaseAuth>['user'];
  profile: ReturnType<typeof useSupabaseAuth>['profile'];
  loading: boolean;
  profileLoading: boolean;
  signIn: ReturnType<typeof useSupabaseAuth>['signIn'];
  signUp: ReturnType<typeof useSupabaseAuth>['signUp'];
  signOut: ReturnType<typeof useSupabaseAuth>['signOut'];
  signInWithGoogle: ReturnType<typeof useSupabaseAuth>['signInWithGoogle'];
  refreshProfile: ReturnType<typeof useSupabaseAuth>['refreshProfile'];
  isOnline: boolean;
};
