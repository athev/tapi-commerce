
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import OrdersLoadingSkeleton from "./OrdersLoadingSkeleton";
import OrdersTable from "./OrdersTable";
import OrdersEmptyState from "./OrdersEmptyState";
import OrdersErrorState from "./OrdersErrorState";

const SellerOrders = () => {
  const { user, profile, profileLoading } = useAuth();

  console.log('SellerOrders component - auth state:', { 
    user: !!user, 
    profile: !!profile, 
    profileLoading,
    role: profile?.role 
  });

  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['seller-orders', user?.id],
    queryFn: async () => {
      console.log("fetchOrders running");
      
      if (!user?.id) {
        console.log('No user found for seller orders');
        throw new Error('User not authenticated');
      }
      
      console.log('Fetching seller orders for user:', user.id);
      
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

        console.log('Fetched orders:', ordersData);
        console.log('Seller orders fetched successfully:', ordersData?.length || 0, 'orders');
        
        if (ordersData && ordersData.length > 0) {
          console.log('Sample order data:', ordersData[0]);
        }
        
        return ordersData || [];
      } catch (error) {
        console.error('Error in seller orders query:', error);
        throw error;
      }
    },
    enabled: !!user?.id && !!profile && profile.role === 'seller' && !profileLoading,
    retry: 2,
    retryDelay: 1000,
  });

  console.log('Query state:', { isLoading, hasError: !!error, ordersCount: orders?.length || 0 });

  // Show loading while profile is being fetched
  if (profileLoading) {
    console.log('Rendering loading skeleton - profile loading');
    return <OrdersLoadingSkeleton />;
  }

  // Block access if no profile or not a seller
  if (!profile || profile.role !== 'seller') {
    console.log('User is not a seller or profile not loaded');
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium mb-2">Không thể truy cập đơn hàng</h3>
        <p className="text-gray-500">
          {!profile 
            ? 'Vui lòng đăng nhập để xem đơn hàng.' 
            : 'Bạn cần phải là người bán để xem đơn hàng.'
          }
        </p>
      </div>
    );
  }

  if (isLoading) {
    console.log('Rendering loading skeleton');
    return <OrdersLoadingSkeleton />;
  }

  if (error) {
    console.error('SellerOrders error:', error);
    return <OrdersErrorState error={error} />;
  }

  console.log('Fetched orders:', orders);
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
