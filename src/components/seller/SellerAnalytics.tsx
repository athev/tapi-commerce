
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Eye, ShoppingCart, Users } from "lucide-react";

const SellerAnalytics = () => {
  // Mock data - in real app, fetch from analytics service
  const analyticsData = {
    views: {
      total: 1250,
      change: 12.5,
      trend: "up"
    },
    clicks: {
      total: 89,
      change: -5.2,
      trend: "down"
    },
    conversions: {
      total: 23,
      change: 18.7,
      trend: "up"
    },
    revenue: {
      total: 2850000,
      change: 25.3,
      trend: "up"
    }
  };

  const topProducts = [
    { name: "Khóa học React cơ bản", views: 450, sales: 12, revenue: 1200000 },
    { name: "Template Landing Page", views: 320, sales: 8, revenue: 800000 },
    { name: "Ebook Marketing Online", views: 280, sales: 6, revenue: 600000 },
    { name: "Plugin WordPress", views: 200, sales: 4, revenue: 400000 }
  ];

  const weeklyData = [
    { day: "T2", views: 180, sales: 3 },
    { day: "T3", views: 220, sales: 5 },
    { day: "T4", views: 190, sales: 2 },
    { day: "T5", views: 250, sales: 6 },
    { day: "T6", views: 210, sales: 4 },
    { day: "T7", views: 160, sales: 2 },
    { day: "CN", views: 140, sales: 1 }
  ];

  const renderTrendIcon = (trend: string) => {
    return trend === "up" ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-600" />
    );
  };

  const renderChangeColor = (change: number) => {
    return change >= 0 ? "text-green-600" : "text-red-600";
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Phân tích & Báo cáo</h2>
        <p className="text-gray-600">Theo dõi hiệu quả kinh doanh của gian hàng</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Lượt xem</p>
                <p className="text-2xl font-bold">{analyticsData.views.total.toLocaleString('vi-VN')}</p>
                <div className={`flex items-center text-sm ${renderChangeColor(analyticsData.views.change)}`}>
                  {renderTrendIcon(analyticsData.views.trend)}
                  <span className="ml-1">+{analyticsData.views.change}%</span>
                </div>
              </div>
              <Eye className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Click vào sản phẩm</p>
                <p className="text-2xl font-bold">{analyticsData.clicks.total}</p>
                <div className={`flex items-center text-sm ${renderChangeColor(analyticsData.clicks.change)}`}>
                  {renderTrendIcon(analyticsData.clicks.trend)}
                  <span className="ml-1">{analyticsData.clicks.change}%</span>
                </div>
              </div>
              <ShoppingCart className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Chuyển đổi</p>
                <p className="text-2xl font-bold">{analyticsData.conversions.total}</p>
                <div className={`flex items-center text-sm ${renderChangeColor(analyticsData.conversions.change)}`}>
                  {renderTrendIcon(analyticsData.conversions.trend)}
                  <span className="ml-1">+{analyticsData.conversions.change}%</span>
                </div>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Doanh thu</p>
                <p className="text-2xl font-bold">
                  {new Intl.NumberFormat('vi-VN', { 
                    style: 'currency', 
                    currency: 'VND',
                    maximumFractionDigits: 0 
                  }).format(analyticsData.revenue.total)}
                </p>
                <div className={`flex items-center text-sm ${renderChangeColor(analyticsData.revenue.change)}`}>
                  {renderTrendIcon(analyticsData.revenue.trend)}
                  <span className="ml-1">+{analyticsData.revenue.change}%</span>
                </div>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Sản phẩm bán chạy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <h3 className="font-medium">{product.name}</h3>
                    <div className="flex space-x-4 text-sm text-gray-600">
                      <span>{product.views} lượt xem</span>
                      <span>{product.sales} lượt bán</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-green-600">
                      {new Intl.NumberFormat('vi-VN', { 
                        style: 'currency', 
                        currency: 'VND',
                        maximumFractionDigits: 0 
                      }).format(product.revenue)}
                    </div>
                    <Badge variant="outline">#{index + 1}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Weekly Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Hiệu quả tuần này</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {weeklyData.map((day, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-8 text-sm font-medium">{day.day}</div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${(day.views / 250) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">{day.views}</span>
                    </div>
                  </div>
                  <div className="w-16 text-right">
                    <Badge variant={day.sales > 3 ? "default" : "secondary"}>
                      {day.sales} bán
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SellerAnalytics;
