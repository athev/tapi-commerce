
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import OrdersLoadingSkeleton from "./OrdersLoadingSkeleton";
import OrdersTable from "./OrdersTable";
import OrdersEmptyState from "./OrdersEmptyState";
import OrdersErrorState from "./OrdersErrorState";

const SellerOrders = () => {
  const { user } = useAuth();

  console.log('SellerOrders component - user state:', user?.id ? 'User available' : 'No user');

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
            product:products!inner(
              id,
              title,
              price,
              product_type,
              seller_id,
              seller_name
            )
          `)
          .eq('product.seller_id', user.id)
          .order('created_at', { ascending: false });
        
        if (ordersError) {
          console.error('Error fetching seller orders:', ordersError);
          throw ordersError;
        }

        console.log('orders fetched:', ordersData);
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
    enabled: !!user?.id,
    retry: 2,
    retryDelay: 1000,
  });

  console.log('Query state:', { isLoading, hasError: !!error, ordersCount: orders?.length || 0 });

  if (isLoading) {
    console.log('Rendering loading skeleton');
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
