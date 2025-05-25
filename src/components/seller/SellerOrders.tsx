
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import OrdersLoadingSkeleton from "./OrdersLoadingSkeleton";
import OrdersTable from "./OrdersTable";
import OrdersEmptyState from "./OrdersEmptyState";
import OrdersErrorState from "./OrdersErrorState";

const SellerOrders = () => {
  const { user, profile, loading, profileLoading } = useAuth();

  console.log('SellerOrders component - auth state:', { 
    user: !!user, 
    profile: !!profile, 
    loading,
    profileLoading,
    role: profile?.role 
  });

  // Only enable query when all auth conditions are met
  const isReadyToFetch = !loading && !profileLoading && !!user?.id && !!profile && profile.role === 'seller';

  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['seller-orders', user?.id],
    queryFn: async () => {
      // Guard clause to prevent execution if conditions aren't met
      if (!user?.id || !profile || loading || profileLoading) {
        console.log('Query guard: Not ready to fetch orders');
        return [];
      }
      
      console.log("fetchOrders running for user:", user.id);
      
      try {
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select(`
            id,
            user_id,
            product_id,
            status,
            created_at,
            updated_at,
            buyer_email,
            buyer_data,
            delivery_status,
            delivery_notes,
            products!inner(
              id,
              title,
              price,
              product_type,
              seller_id,
              seller_name
            )
          `)
          .eq('products.seller_id', user.id)
          .order('created_at', { ascending: false });
        
        if (ordersError) {
          console.error('Error fetching seller orders:', ordersError);
          throw ordersError;
        }

        console.log('Seller orders fetched successfully:', ordersData?.length || 0, 'orders');
        return ordersData || [];
      } catch (error) {
        console.error('Error in seller orders query:', error);
        throw error;
      }
    },
    enabled: isReadyToFetch,
    retry: 2,
    retryDelay: 1000,
    // Add staleTime to prevent unnecessary refetches
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  console.log('Query state:', { 
    isLoading, 
    hasError: !!error, 
    ordersCount: orders?.length || 0,
    isReadyToFetch
  });

  // Show loading while profile is being fetched
  if (loading || profileLoading) {
    console.log('Rendering loading skeleton - auth loading');
    return <OrdersLoadingSkeleton />;
  }

  // Check if user is authenticated
  if (!user) {
    console.log('User not authenticated');
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium mb-2">Cần đăng nhập</h3>
        <p className="text-gray-500">Vui lòng đăng nhập để xem đơn hàng.</p>
      </div>
    );
  }

  // Check if profile exists and user is a seller
  if (!profile || profile.role !== 'seller') {
    console.log('User is not a seller or profile not loaded');
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium mb-2">Không thể tải đơn hàng</h3>
        <p className="text-gray-500">Bạn cần phải là người bán để xem đơn hàng.</p>
      </div>
    );
  }

  if (isLoading) {
    console.log('Rendering loading skeleton - query loading');
    return <OrdersLoadingSkeleton />;
  }

  if (error) {
    console.error('SellerOrders error:', error);
    return <OrdersErrorState error={error} />;
  }

  console.log('Rendering orders:', orders?.length || 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Đơn hàng</h2>
        <div className="text-sm text-gray-600">
          Tổng: {orders?.length || 0} đơn hàng
        </div>
      </div>
      
      {orders && orders.length > 0 ? (
        <OrdersTable orders={orders} />
      ) : (
        <OrdersEmptyState />
      )}
    </div>
  );
};

export default SellerOrders;
