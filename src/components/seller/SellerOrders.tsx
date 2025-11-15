
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import OrdersLoadingSkeleton from "./OrdersLoadingSkeleton";
import OrdersTable from "./OrdersTable";
import OrdersEmptyState from "./OrdersEmptyState";
import OrdersErrorState from "./OrdersErrorState";
import OrdersFilters from "./OrdersFilters";

const SellerOrders = () => {
  const { user, profile } = useAuth();
  const [statusFilter, setStatusFilter] = useState('all');
  const [deliveryFilter, setDeliveryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  console.log('SellerOrders component - auth state:', { 
    user: !!user, 
    profile: !!profile, 
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
            delivery_status,
            delivery_notes,
            discount_amount,
            bank_amount,
            payment_verified_at,
            voucher_id,
            bank_transaction_id,
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
    enabled: !!user?.id,
    retry: 2,
    retryDelay: 1000,
  });

  console.log('Query state:', { isLoading, hasError: !!error, ordersCount: orders?.length || 0 });

  // Filter and search orders
  const filteredOrders = useMemo(() => {
    if (!orders) return [];

    return orders.filter(order => {
      // Status filter
      if (statusFilter !== 'all' && order.status !== statusFilter) {
        return false;
      }

      // Delivery status filter
      if (deliveryFilter !== 'all' && order.delivery_status !== deliveryFilter) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesId = order.id.toLowerCase().includes(query);
        const matchesEmail = order.buyer_email?.toLowerCase().includes(query);
        const matchesProduct = order.products?.title?.toLowerCase().includes(query);
        
        if (!matchesId && !matchesEmail && !matchesProduct) {
          return false;
        }
      }

      return true;
    });
  }, [orders, statusFilter, deliveryFilter, searchQuery]);

  // Block access if not logged in
  if (!user) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium mb-2">Bạn cần đăng nhập</h3>
        <p className="text-gray-500">
          Vui lòng đăng nhập để xem đơn hàng.
        </p>
      </div>
    );
  }

  // Check if user is not a seller yet
  if (!profile || profile.role !== 'seller') {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium mb-2">Bạn chưa đăng ký gian hàng</h3>
        <p className="text-gray-500 mb-4">
          Bấm vào đây để tạo gian hàng đầu tiên
        </p>
        <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
          Đăng ký làm người bán
        </button>
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
        <div className="text-sm text-muted-foreground">
          Hiển thị: {filteredOrders?.length || 0} / {orders?.length || 0} đơn hàng
        </div>
      </div>

      <OrdersFilters
        statusFilter={statusFilter}
        deliveryFilter={deliveryFilter}
        searchQuery={searchQuery}
        onStatusChange={setStatusFilter}
        onDeliveryChange={setDeliveryFilter}
        onSearchChange={setSearchQuery}
      />
      
      {filteredOrders && filteredOrders.length > 0 ? (
        <OrdersTable orders={filteredOrders} />
      ) : orders && orders.length > 0 ? (
        <div className="text-center py-12 bg-muted/50 rounded-lg">
          <p className="text-muted-foreground">Không tìm thấy đơn hàng phù hợp với bộ lọc</p>
        </div>
      ) : (
        <OrdersEmptyState />
      )}
    </div>
  );
};

export default SellerOrders;
