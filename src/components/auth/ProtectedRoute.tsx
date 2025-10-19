
import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserRoles } from "@/hooks/useUserRoles";
import { toast } from "@/hooks/use-toast";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, profile, loading } = useAuth();
  const { data: userRoles, isLoading: rolesLoading } = useUserRoles();
  const location = useLocation();

  console.log('ProtectedRoute check:', { 
    user: !!user, 
    profile, 
    loading, 
    rolesLoading,
    userRoles,
    allowedRoles, 
    currentPath: location.pathname 
  });

  // Show loading state while checking authentication
  if (loading || rolesLoading) {
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

  // Check if user has required role using user_roles table
  const hasRequiredRole = userRoles?.some(role => allowedRoles.includes(role)) || false;

  if (!hasRequiredRole) {
    console.log('User role not allowed:', { userRoles, allowedRoles });
    toast({
      title: "Không có quyền truy cập",
      description: "Bạn không có quyền truy cập trang này",
      variant: "destructive",
    });
    return <Navigate to="/" replace />;
  }

  console.log('Access granted to protected route');
  return <>{children}</>;
};

export default ProtectedRoute;
