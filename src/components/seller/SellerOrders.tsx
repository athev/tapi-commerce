
import { useQuery } from "@tanstack/react-query";
import { supabase, Order, Product } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', { 
    style: 'currency', 
    currency: 'VND',
    maximumFractionDigits: 0 
  }).format(price);
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const SellerOrders = () => {
  const { user } = useAuth();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['seller-orders', user?.id],
    queryFn: async () => {
      try {
        if (!user) return [];
        
        console.log('Fetching seller orders for user:', user.id);
        
        // First get the seller's products
        const { data: sellerProducts, error: productsError } = await supabase
          .from('products')
          .select('id')
          .eq('seller_id', user.id);
        
        if (productsError) {
          console.error('Error fetching seller products:', productsError);
          return [];
        }

        if (!sellerProducts || sellerProducts.length === 0) {
          console.log('No products found for seller');
          return [];
        }

        const productIds = sellerProducts.map(p => p.id);
        
        // Then get orders for these products
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('*')
          .in('product_id', productIds)
          .order('created_at', { ascending: false });
        
        if (ordersError) {
          console.error('Error fetching orders:', ordersError);
          return [];
        }

        if (!ordersData || ordersData.length === 0) {
          console.log('No orders found for seller products');
          return [];
        }

        // Get product details for the orders
        const { data: productsData, error: productDetailsError } = await supabase
          .from('products')
          .select('*')
          .in('id', productIds);

        if (productDetailsError) {
          console.error('Error fetching product details:', productDetailsError);
          return [];
        }

        // Combine orders with product details
        const ordersWithProducts = ordersData.map(order => {
          const product = productsData?.find(p => p.id === order.product_id);
          return {
            ...order,
            product: product || null
          };
        }).filter(order => order.product !== null);

        console.log('Seller orders with products:', ordersWithProducts);
        return ordersWithProducts as (Order & { product: Product })[];
      } catch (error) {
        console.error('Error fetching seller orders:', error);
        return [];
      }
    },
    enabled: !!user,
  });

  if (isLoading) {
    return <div className="flex justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-marketplace-primary"></div>
    </div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Đơn hàng</h2>
      
      {orders && orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="h-16 w-16 bg-gray-100 rounded overflow-hidden shrink-0">
                    <img 
                      src={order.product.image || '/placeholder.svg'} 
                      alt={order.product.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <div className="font-medium">{order.product.title}</div>
                    <div className="text-sm text-gray-500">
                      Ngày đặt: {formatDate(order.created_at)}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-medium text-marketplace-primary">
                      {formatPrice(order.product.price)}
                    </div>
                    <div>
                      <Badge className={
                        order.status === 'paid' ? 'bg-green-500' : 
                        order.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                      }>
                        {order.status === 'paid' ? 'Đã thanh toán' : 
                         order.status === 'pending' ? 'Chờ thanh toán' : 'Đã hủy'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium mb-2">Chưa có đơn hàng nào</h3>
          <p className="text-gray-500">Đơn hàng của khách hàng sẽ xuất hiện ở đây.</p>
        </div>
      )}
    </div>
  );
};

export default SellerOrders;
