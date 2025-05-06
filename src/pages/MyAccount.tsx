
import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/context/AuthContext";
import { supabase, Order, Product } from "@/lib/supabase";
import { Download, User, ShoppingBag } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

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

const MyAccount = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    document.title = "Tài khoản của tôi | DigitalMarket";
    
    // Redirect if not logged in
    if (!user && !localStorage.getItem('checking-auth')) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Fetch user's purchased products
  const { data: purchasedProducts, isLoading } = useQuery({
    queryKey: ['purchases', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          product:products(*)
        `)
        .eq('user_id', user.id)
        .eq('status', 'paid')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data as (Order & { product: Product })[];
    },
    enabled: !!user,
  });

  if (!user) {
    return null; // will redirect in useEffect
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 container py-12">
        <h1 className="text-3xl font-bold mb-8">Tài khoản của tôi</h1>
        
        <Tabs defaultValue="purchases">
          <TabsList className="mb-8">
            <TabsTrigger value="purchases">Sản phẩm đã mua</TabsTrigger>
            <TabsTrigger value="profile">Thông tin cá nhân</TabsTrigger>
          </TabsList>
          
          <TabsContent value="purchases">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Sản phẩm đã mua</h2>
              </div>
              
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-marketplace-primary"></div>
                </div>
              ) : purchasedProducts && purchasedProducts.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {purchasedProducts.map((item) => (
                    <Card key={item.id}>
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                          <div className="h-20 w-20 bg-gray-100 rounded overflow-hidden shrink-0">
                            <img 
                              src={item.product.image || '/placeholder.svg'} 
                              alt={item.product.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          
                          <div className="flex-1">
                            <Link to={`/product/${item.product.id}`} className="font-semibold hover:text-marketplace-primary">
                              {item.product.title}
                            </Link>
                            <div className="text-sm text-gray-500">
                              Mua ngày: {formatDate(item.created_at)}
                            </div>
                            <div className="text-marketplace-primary font-medium mt-1">
                              {formatPrice(item.product.price)}
                            </div>
                          </div>
                          
                          <div>
                            <Button 
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => window.open(item.product.file_url, '_blank')}
                              disabled={!item.product.file_url}
                            >
                              <Download className="h-4 w-4 mr-2" /> Tải xuống
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-6 text-center">
                    <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Chưa có sản phẩm nào</h3>
                    <p className="text-gray-500 mb-4">Bạn chưa mua sản phẩm nào. Khám phá các sản phẩm của chúng tôi ngay!</p>
                    <Button onClick={() => navigate('/')}>Mua sắm ngay</Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="profile">
            <div className="space-y-6">
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
                        <div className="font-medium">{profile?.full_name || user.user_metadata?.full_name || 'Chưa cập nhật'}</div>
                      </div>
                      
                      <div>
                        <div className="text-sm text-gray-500">Email</div>
                        <div className="font-medium">{user.email}</div>
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
                          {user.created_at ? formatDate(user.created_at) : 'Không xác định'}
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
            </div>
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
};

export default MyAccount;
