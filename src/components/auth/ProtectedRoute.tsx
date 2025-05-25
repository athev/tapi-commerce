
import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  console.log('ProtectedRoute check:', { user: !!user, profile, loading, allowedRoles, currentPath: location.pathname });

  // For development, temporarily bypass authentication
  // Just show the content directly
  console.log('Development mode: bypassing authentication checks');
  return <>{children}</>;

  // Original authentication logic (commented out for development)
  /*
  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="container py-8">
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    console.log('User not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If we don't have profile data yet, try to wait a bit
  if (!profile) {
    console.log('Profile not loaded yet');
    return (
      <div className="flex flex-col min-h-screen">
        <div className="container py-8">
          <div className="text-center">
            <p>Đang tải thông tin người dùng...</p>
          </div>
        </div>
      </div>
    );
  }

  // Check if user has required role
  if (!allowedRoles.includes(profile.role)) {
    console.log('User role not allowed:', { userRole: profile.role, allowedRoles });
    return <Navigate to="/" replace />;
  }

  console.log('Access granted to protected route');
  return <>{children}</>;
  */
};

export default ProtectedRoute;
