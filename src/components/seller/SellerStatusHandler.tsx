
import { useEffect } from "react";
import { useSellerStatus } from "@/hooks/useSellerStatus";
import { useAuth } from "@/context/AuthContext";
import { useUserRoles } from "@/hooks/useUserRoles";
import SellerApplicationForm from "./SellerApplicationForm";
import { Card, CardContent } from "@/components/ui/card";

interface SellerStatusHandlerProps {
  children: React.ReactNode;
}

const SellerStatusHandler = ({ children }: SellerStatusHandlerProps) => {
  const { user, refreshProfile, profile } = useAuth();
  const { data: userRoles, isLoading: rolesLoading } = useUserRoles();
  const { sellerStatus, sellerApplication, loading: statusLoading, refreshSellerStatus } = useSellerStatus();

  const loading = statusLoading || rolesLoading;
  const hasSellerRole = userRoles?.includes('seller' as any) || userRoles?.includes('admin' as any);

  // Refresh profile and seller status when component mounts
  useEffect(() => {
    if (user) {
      console.log('🔄 [SELLER_HANDLER] Refreshing profile and seller status');
      console.log('🔄 [SELLER_HANDLER] User roles:', userRoles);
      refreshProfile();
      refreshSellerStatus();
    }
  }, [user?.id]); // Only depend on user.id

  console.log('🎨 [SELLER_HANDLER] Render:', { 
    hasUser: !!user, 
    profile: profile,
    profileRole: profile?.role,
    userRoles,
    hasSellerRole,
    sellerStatus, 
    sellerApplication,
    loading 
  });

  // Priority check: user_roles table (primary source)
  if (hasSellerRole && !loading) {
    console.log('✅ [SELLER_HANDLER] User has seller/admin role in user_roles table');
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Bạn cần đăng nhập
            </h3>
            <p className="text-gray-500 mb-4">
              Vui lòng đăng nhập để truy cập khu vực người bán
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  switch (sellerStatus) {
    case 'approved_seller':
      // User is an approved seller, show the full dashboard
      console.log('✅ [SELLER_HANDLER] Showing seller dashboard for approved seller');
      return <>{children}</>;

    case 'pending_approval':
      // User has applied and is waiting for approval
      return (
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <div className="mb-4">
                <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Đang chờ duyệt
              </h3>
              <p className="text-gray-500 mb-2">
                Đăng ký người bán của bạn đang được xem xét
              </p>
              <p className="text-sm text-gray-400">
                Chúng tôi sẽ phản hồi sớm nhất có thể
              </p>
            </div>
          </CardContent>
        </Card>
      );

    case 'rejected':
      // User's application was rejected, they can apply again
      return (
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-4">
                <div className="mb-4">
                  <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-lg font-medium text-red-900 mb-2">
                  Đăng ký bị từ chối
                </h3>
                <p className="text-red-600 mb-4">
                  Đăng ký người bán của bạn đã bị từ chối. Bạn có thể đăng ký lại với thông tin mới.
                </p>
              </div>
            </CardContent>
          </Card>
          <SellerApplicationForm />
        </div>
      );

    case 'buyer':
    default:
      // User is a buyer and hasn't applied yet, show application form
      return (
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Bạn chưa đăng ký gian hàng
                </h3>
                <p className="text-gray-500 mb-4">
                  Bấm vào đây để tạo gian hàng đầu tiên
                </p>
              </div>
            </CardContent>
          </Card>
          <SellerApplicationForm />
        </div>
      );
  }
};

export default SellerStatusHandler;
