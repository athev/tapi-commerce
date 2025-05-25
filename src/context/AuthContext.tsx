
// Re-export everything from the refactored components
export { AuthContext } from './AuthContext';
export { AuthProvider } from '@/components/auth/AuthProvider';
export { useAuth } from '@/hooks/useAuth';
export type { AuthContextType, AuthProviderProps } from './types/AuthTypes';
