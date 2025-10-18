
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Order, Product, mockProducts } from "@/lib/supabase";
import { useAuth } from "@/context";
import Navbar from "@/components/layout/Navbar";
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

const MyPurchases = () => {
  const { user, profile } = useAuth();
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
        <Navbar />
        <main className="flex-1 container py-12">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-marketplace-primary"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 container py-12">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Tài khoản của tôi</h1>
          
          <Tabs defaultValue="purchases">
            <TabsList className="mb-8">
              <TabsTrigger value="purchases">Sản phẩm đã mua</TabsTrigger>
              <TabsTrigger value="profile">Thông tin cá nhân</TabsTrigger>
            </TabsList>
            
            <TabsContent value="purchases">
              {purchases && purchases.length > 0 ? (
                <div className="space-y-6">
                  {purchases.map((purchase) => (
                    <Card key={purchase.id}>
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row gap-6">
                          {/* Product Image */}
                          <div className="w-full md:w-32 h-32 bg-gray-100 rounded overflow-hidden shrink-0">
                            <img 
                              src={purchase.product.image || '/placeholder.svg'} 
                              alt={purchase.product.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          
                          {/* Product Info */}
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h3 className="text-xl font-semibold mb-2">
                                  {purchase.product.title}
                                </h3>
                                <p className="text-gray-600 mb-2">
                                  Người bán: {purchase.product.seller_name}
                                </p>
                                <p className="text-sm text-gray-500">
                                  Ngày mua: {formatDate(purchase.created_at)}
                                </p>
                                <p className="text-sm text-gray-500">
                                  Đơn hàng: #{purchase.id.slice(0, 8)}
                                </p>
                              </div>
                              
                              <div className="text-right">
                                <div className="text-lg font-bold text-marketplace-primary mb-2">
                                  {formatPrice(purchase.product.price)}
                                </div>
                                <Badge className={
                                  purchase.status === 'paid' ? 'bg-green-500' : 
                                  purchase.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                                }>
                                  {purchase.status === 'paid' ? 'Đã thanh toán' : 
                                   purchase.status === 'pending' ? 'Chờ thanh toán' : 'Đã hủy'}
                                </Badge>
                                {purchase.delivery_status && (
                                  <div className="mt-1">
                                    <Badge variant="outline" className={
                                      purchase.delivery_status === 'delivered' || purchase.delivery_status === 'completed' ? 'border-green-500 text-green-700' :
                                      purchase.delivery_status === 'processing' ? 'border-blue-500 text-blue-700' :
                                      purchase.delivery_status === 'disputed' ? 'border-red-500 text-red-700' :
                                      'border-gray-500 text-gray-700'
                                    }>
                                      {purchase.delivery_status === 'delivered' ? 'Đã giao' :
                                       purchase.delivery_status === 'completed' ? 'Hoàn thành' :
                                       purchase.delivery_status === 'processing' ? 'Đang xử lý' :
                                       purchase.delivery_status === 'disputed' ? 'Tranh chấp' :
                                       'Chờ xử lý'}
                                    </Badge>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {/* Description */}
                            <p className="text-gray-600 mb-4 line-clamp-2">
                              {purchase.product.description}
                            </p>
                            
                            {/* Actions */}
                            <div className="flex flex-wrap gap-3">
                              <Button asChild variant="outline">
                                <Link to={`/product/${purchase.product.id}`}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Xem chi tiết
                                </Link>
                              </Button>
                              
                              {purchase.status === 'paid' && (
                                <Button 
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={() => handleDownload(purchase.product)}
                                >
                                  <Download className="h-4 w-4 mr-2" />
                                  Tải xuống
                                </Button>
                              )}
                              
                              {purchase.status === 'pending' && !isUsingMockData && (
                                <Button asChild>
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
                                    variant="outline"
                                    size="default"
                                  />

                                  <OrderDisputeButton 
                                    orderId={purchase.id}
                                    status={purchase.status}
                                    deliveryStatus={purchase.delivery_status}
                                    variant="outline"
                                    size="default"
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
      
      <Footer />
    </div>
  );
};

export default MyPurchases;
