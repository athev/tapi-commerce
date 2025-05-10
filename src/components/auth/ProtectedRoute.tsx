
import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // If user is logged in but doesn't have the required role
    if (user && profile && !loading && !allowedRoles.includes(profile.role)) {
      toast.error('Bạn không có quyền truy cập trang này');
    }
  }, [user, profile, loading, allowedRoles]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-marketplace-primary"></div>
      </div>
    );
  }

  // If not logged in, redirect to login page with return URL
  if (!user) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  // If user doesn't have the required role
  if (profile && !allowedRoles.includes(profile.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
