
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Order, Product, mockProducts } from "@/lib/supabase";
import { useAuth } from "@/context";
import EnhancedNavbar from "@/components/layout/EnhancedNavbar";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Eye, User } from "lucide-react";
import { Link } from "react-router-dom";
import OrderSupportChatButton from "@/components/chat/OrderSupportChatButton";
import OrderConfirmButton from "@/components/buyer/OrderConfirmButton";
import OrderDisputeButton from "@/components/buyer/OrderDisputeButton";
import OrderDetailsModal from "@/components/orders/OrderDetailsModal";
import OrderTimeline from "@/components/orders/OrderTimeline";
import { formatPrice, formatSoldCount } from "@/utils/priceUtils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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


const MyPurchases = () => {
  const { user, profile } = useAuth();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isUsingMockData, setIsUsingMockData] = useState(false);

  // Mock data for development
  const mockOrders = [
    {
      id: '1',
      user_id: user?.id || 'user1',
      product_id: '1',
      status: 'paid' as const,
      created_at: '2025-01-15T10:30:00Z',
      delivery_status: 'delivered',
      product: {
        ...mockProducts[0],
        seller_id: 'seller1'
      }
    },
    {
      id: '2',
      user_id: user?.id || 'user1', 
      product_id: '2',
      status: 'paid' as const,
      created_at: '2025-01-10T14:20:00Z',
      delivery_status: 'processing',
      product: {
        ...mockProducts[1],
        seller_id: 'seller2'
      }
    },
    {
      id: '3',
      user_id: user?.id || 'user1',
      product_id: '3', 
      status: 'pending' as const,
      created_at: '2025-01-20T09:15:00Z',
      delivery_status: 'pending',
      product: {
        ...mockProducts[2],
        seller_id: 'seller3'
      }
    }
  ];

  const { data: purchases, isLoading } = useQuery({
    queryKey: ['user-purchases', user?.id],
    queryFn: async () => {
      try {
        if (!user) {
          setIsUsingMockData(true);
          return mockOrders;
        }
        
        console.log('Fetching user purchases for:', user.id);
        
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (ordersError) {
          console.error('Error fetching orders:', ordersError);
          setIsUsingMockData(true);
          return mockOrders;
        }

        if (!ordersData || ordersData.length === 0) {
          console.log('No orders found');
          setIsUsingMockData(false);
          return [];
        }

        // Get product details for the orders
        const productIds = ordersData.map(order => order.product_id);
        const { data: productsData, error: productError } = await supabase
          .from('products')
          .select('*')
          .in('id', productIds);

        if (productError) {
          console.error('Error fetching products:', productError);
          // Don't use mock data if we have real orders
          return ordersData.map(order => ({
            ...order,
            product: mockProducts[0]
          })) as (Order & { product: Product })[];
        }

        // Combine orders with product details
        const ordersWithProducts = ordersData.map(order => {
          const product = productsData?.find(p => p.id === order.product_id);
          return {
            ...order,
            product: product || mockProducts[0]
          };
        });

        console.log('User purchases:', ordersWithProducts);
        setIsUsingMockData(false);
        return ordersWithProducts as (Order & { product: Product })[];
      } catch (error) {
        console.error('Error fetching user purchases:', error);
        setIsUsingMockData(true);
        return mockOrders;
      }
    },
    enabled: true,
  });

  const handleDownload = (product: Product) => {
    if (product.file_url) {
      window.open(product.file_url, '_blank');
    } else {
      // For demo purposes, show a mock download
      const link = document.createElement('a');
      link.href = 'data:text/plain;charset=utf-8,Sample Digital Product Content';
      link.download = `${product.title}.txt`;
      link.click();
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <EnhancedNavbar />
        <main className="flex-1 container py-12">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </main>
        <MobileBottomNav />
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <EnhancedNavbar />
      
      <main className="flex-1 container py-12">
        <div className="max-w-5xl mx-auto">
          <h1 className="page-title">Tài khoản của tôi</h1>
          
          <Tabs defaultValue="purchases">
            <TabsList className="mb-8">
              <TabsTrigger value="purchases">Sản phẩm đã mua</TabsTrigger>
              <TabsTrigger value="profile">Thông tin cá nhân</TabsTrigger>
            </TabsList>
            
            <TabsContent value="purchases">
              {/* Filter/Sort Toolbar */}
              <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <Select>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="pending">Chờ thanh toán</SelectItem>
                      <SelectItem value="paid">Đã thanh toán</SelectItem>
                      <SelectItem value="delivered">Đã giao</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Sắp xếp" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Mới nhất</SelectItem>
                      <SelectItem value="oldest">Cũ nhất</SelectItem>
                      <SelectItem value="price-high">Giá cao</SelectItem>
                      <SelectItem value="price-low">Giá thấp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  Tổng {purchases?.length || 0} đơn hàng
                </div>
              </div>

              {purchases && purchases.length > 0 ? (
                <div className="space-y-6">
                  {purchases.map((purchase) => (
                    <Card key={purchase.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row gap-6">
                          {/* Product Image - Enhanced */}
                          <div className="relative w-full md:w-40 h-40 bg-muted rounded-lg overflow-hidden shrink-0">
                            <img 
                              src={purchase.product.image || '/placeholder.svg'} 
                              alt={purchase.product.title}
                              className="w-full h-full object-cover"
                            />
                            {/* Status overlay */}
                            <div className="absolute top-2 right-2">
                              <Badge className={
                                purchase.status === 'paid' ? 'bg-success hover:bg-success' : 
                                purchase.status === 'pending' ? 'bg-warning hover:bg-warning' : 'bg-destructive hover:bg-destructive'
                              }>
                                {purchase.status === 'paid' ? 'Đã thanh toán' : 
                                 purchase.status === 'pending' ? 'Chờ thanh toán' : 'Đã hủy'}
                              </Badge>
                            </div>
                          </div>
                          
                          {/* Product Info - Better organized */}
                          <div className="flex-1 content-spacing">
                            {/* Header Row */}
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <Link 
                                  to={`/product/${purchase.product_id}`}
                                  className="card-title hover:text-primary transition-colors line-clamp-2"
                                >
                                  {purchase.product.title}
                                </Link>
                                <p className="body-text-sm mt-1">
                                  Người bán: {purchase.product.seller_name}
                                </p>
                              </div>
                              
                              <div className="text-right">
                                <div className="price-main">
                                  {formatPrice(purchase.product.price)}
                                </div>
                              </div>
                            </div>

                            {/* Order Timeline */}
                            <OrderTimeline 
                              status={purchase.status}
                              deliveryStatus={purchase.delivery_status}
                              createdAt={purchase.created_at}
                              paidAt={purchase.payment_verified_at}
                            />
                            
                            {/* Actions Row */}
                            <div className="flex flex-wrap gap-3 pt-3 border-t">
                              <Button 
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedOrder(purchase)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Chi tiết
                              </Button>
                              
                              {purchase.status === 'paid' && purchase.product.file_url && (
                                <Button 
                                  variant="default"
                                  size="sm"
                                  onClick={() => handleDownload(purchase.product)}
                                >
                                  <Download className="h-4 w-4 mr-2" />
                                  Tải xuống
                                </Button>
                              )}
                              
                              {purchase.status === 'pending' && !isUsingMockData && (
                                <Button asChild size="sm">
                                  <Link to={`/payment/${purchase.id}`}>
                                    Hoàn tất thanh toán
                                  </Link>
                                </Button>
                              )}

                              {!isUsingMockData && (
                                <>
                                  <OrderConfirmButton 
                                    orderId={purchase.id}
                                    status={purchase.status}
                                    deliveryStatus={purchase.delivery_status}
                                    variant="default"
                                    size="sm"
                                  />

                                  <OrderDisputeButton 
                                    orderId={purchase.id}
                                    status={purchase.status}
                                    deliveryStatus={purchase.delivery_status}
                                    variant="outline"
                                    size="sm"
                                  />

                                  <OrderSupportChatButton 
                                    order={{
                                      id: purchase.id,
                                      status: purchase.status,
                                      created_at: purchase.created_at,
                                      delivery_status: purchase.delivery_status,
                                      products: {
                                        title: purchase.product.title,
                                        price: purchase.product.price
                                      },
                                      user_id: purchase.user_id
                                    }}
                                    sellerId={purchase.product.seller_id || 'default-seller'}
                                    variant="outline"
                                  />
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-medium mb-2">Chưa có sản phẩm nào</h3>
                  <p className="text-gray-500 mb-6">Bạn chưa mua sản phẩm nào. Hãy khám phá các sản phẩm tuyệt vời!</p>
                  <Button asChild>
                    <Link to="/">Khám phá sản phẩm</Link>
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin tài khoản</CardTitle>
                  <CardDescription>Thông tin cá nhân của bạn</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-center mb-6">
                      <div className="h-24 w-24 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="h-12 w-12 text-gray-500" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-500">Tên</div>
                        <div className="font-medium">{profile?.full_name || user?.user_metadata?.full_name || 'Chưa cập nhật'}</div>
                      </div>
                      
                      <div>
                        <div className="text-sm text-gray-500">Email</div>
                        <div className="font-medium">{user?.email}</div>
                      </div>
                      
                      <div>
                        <div className="text-sm text-gray-500">Vai trò</div>
                        <div className="font-medium">
                          {profile?.role === 'admin' ? 'Quản trị viên' : 
                           profile?.role === 'seller' ? 'Người bán' : 'Khách hàng'}
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-sm text-gray-500">Ngày tham gia</div>
                        <div className="font-medium">
                          {user?.created_at ? formatDate(user.created_at) : 'Không xác định'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-6 border-t mt-6">
                      <Button variant="outline" className="w-full md:w-auto">
                        Chỉnh sửa thông tin
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <MobileBottomNav />
      <Footer />

      {selectedOrder && (
        <OrderDetailsModal
          open={!!selectedOrder}
          onOpenChange={(open) => !open && setSelectedOrder(null)}
          order={selectedOrder}
        />
      )}
    </div>
  );
};

export default MyPurchases;
