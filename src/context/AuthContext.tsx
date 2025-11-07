
import { createContext, useContext } from 'react';
import { AuthContextType } from './AuthContextTypes';

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  loading: true,
  profileLoading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null, success: false }),
  signOut: async () => {},
  signInWithGoogle: async () => ({ error: null }),
  refreshProfile: async () => {},
  isOnline: true,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthContext };
