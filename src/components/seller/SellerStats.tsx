
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Package, DollarSign, Users } from "lucide-react";

const SellerStats = () => {
  const { user, profile, profileLoading } = useAuth();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['seller-stats', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      // Fetch products count and total sales
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, price, purchases')
        .eq('seller_id', user.id);
      
      if (productsError) throw productsError;

      // Fetch orders count
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id, product_id')
        .in('product_id', products?.map(p => p.id) || []);
      
      if (ordersError) throw ordersError;

      const totalProducts = products?.length || 0;
      const totalRevenue = products?.reduce((sum, product) => 
        sum + (product.price * (product.purchases || 0)), 0) || 0;
      const totalOrders = orders?.length || 0;
      const totalSales = products?.reduce((sum, product) => 
        sum + (product.purchases || 0), 0) || 0;

      return {
        totalProducts,
        totalRevenue,
        totalOrders,
        totalSales
      };
    },
    enabled: !!user && !!profile && profile.role === 'seller' && !profileLoading
  });

  // Show loading while profile is being fetched
  if (profileLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Block access if no profile or not a seller
  if (!profile || profile.role !== 'seller') {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium mb-2">Không thể truy cập thống kê</h3>
        <p className="text-gray-500">
          {!profile 
            ? 'Vui lòng đăng nhập để xem thống kê.' 
            : 'Bạn cần phải là người bán để xem thống kê.'
          }
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: "Tổng sản phẩm",
      value: stats?.totalProducts || 0,
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Doanh thu",
      value: new Intl.NumberFormat('vi-VN', { 
        style: 'currency', 
        currency: 'VND',
        maximumFractionDigits: 0 
      }).format(stats?.totalRevenue || 0),
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Đơn hàng",
      value: stats?.totalOrders || 0,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "Lượt bán",
      value: stats?.totalSales || 0,
      icon: Users,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {statCards.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SellerStats;
