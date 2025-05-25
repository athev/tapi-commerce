
import { createContext } from 'react';
import { AuthContextType } from './types/AuthTypes';

export const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  loading: true,
  profileLoading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null, success: false }),
  signOut: async () => {},
  refreshProfile: async () => {},
  isOnline: true,
});

// Re-export the AuthProvider component
export { AuthProvider } from '@/components/auth/AuthProvider';

// Re-export the useAuth hook from the correct location
export { useAuth } from '@/hooks/useAuth';

// Re-export types
export type { AuthContextType, AuthProviderProps } from './types/AuthTypes';
