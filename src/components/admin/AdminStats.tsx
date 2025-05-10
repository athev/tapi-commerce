
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, ShoppingBag, Download, TrendingUp } from "lucide-react";

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', { 
    style: 'currency', 
    currency: 'VND',
    maximumFractionDigits: 0 
  }).format(price);
};

const AdminStats = () => {
  // Fetch summary data
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      try {
        // In a real implementation, fetch stats from Supabase
        // For demo, return mock data
        return {
          totalUsers: 120,
          totalProducts: 67,
          totalSales: 8700000,
          totalOrders: 94,
          recentSales: [
            { name: 'T.1', value: 2200000 },
            { name: 'T.2', value: 3100000 },
            { name: 'T.3', value: 2800000 },
            { name: 'T.4', value: 3900000 },
            { name: 'T.5', value: 4200000 },
            { name: 'T.6', value: 3700000 },
          ],
          categoryBreakdown: [
            { name: 'Ebook', value: 32 },
            { name: 'Khóa học', value: 21 },
            { name: 'Phần mềm', value: 16 },
            { name: 'Template', value: 12 },
            { name: 'Âm nhạc', value: 8 },
          ]
        };
      } catch (error) {
        console.error('Error fetching admin stats:', error);
        return null;
      }
    }
  });

  if (isLoading || !stats) {
    return <div className="flex justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-marketplace-primary"></div>
    </div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold mb-6">Thống kê tổng quan</h2>
      
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500 mb-1">Tổng người dùng</div>
              <div className="text-3xl font-bold">{stats.totalUsers}</div>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500 mb-1">Tổng sản phẩm</div>
              <div className="text-3xl font-bold">{stats.totalProducts}</div>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Download className="h-6 w-6 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500 mb-1">Tổng doanh số</div>
              <div className="text-3xl font-bold">{formatPrice(stats.totalSales)}</div>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500 mb-1">Tổng đơn hàng</div>
              <div className="text-3xl font-bold">{stats.totalOrders}</div>
            </div>
            <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
              <ShoppingBag className="h-6 w-6 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Sales trend chart */}
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Doanh thu theo tháng</CardTitle>
          <CardDescription>
            Tổng doanh thu theo từng tháng trong 6 tháng gần nhất
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={stats.recentSales}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis 
                  tickFormatter={(value) => 
                    new Intl.NumberFormat('vi-VN', { 
                      notation: 'compact',
                      compactDisplay: 'short',
                      maximumFractionDigits: 1
                    }).format(value)
                  } 
                />
                <Tooltip 
                  formatter={(value) => 
                    [formatPrice(value as number), 'Doanh thu']
                  } 
                />
                <Legend />
                <Bar dataKey="value" name="Doanh thu" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      {/* Category breakdown chart */}
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Phân bổ sản phẩm theo danh mục</CardTitle>
          <CardDescription>
            Số lượng sản phẩm trong từng danh mục
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={stats.categoryBreakdown}
                layout="vertical"
                margin={{ top: 20, right: 30, left: 60, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name="Số lượng" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminStats;
