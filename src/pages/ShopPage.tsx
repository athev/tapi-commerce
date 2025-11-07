import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import EnhancedNavbar from "@/components/layout/EnhancedNavbar";
import Footer from "@/components/layout/Footer";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Store, Star, MessageCircle, MapPin, Phone, Package, ShoppingCart } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";

const ShopPage = () => {
  const { sellerId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [seller, setSeller] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    document.title = "Gian hàng | DigitalMarket";
    
    const fetchShopData = async () => {
      if (!sellerId) return;

      try {
        // Fetch seller profile
        const { data: sellerData, error: sellerError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', sellerId)
          .single();

        if (sellerError) throw sellerError;
        setSeller(sellerData);

        // Fetch seller's products
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .eq('seller_id', sellerId)
          .eq('status', 'active')
          .order('created_at', { ascending: false });

        if (productsError) throw productsError;
        setProducts(productsData || []);

        // Update page title with shop name
        if (sellerData?.full_name) {
          document.title = `${sellerData.full_name} | DigitalMarket`;
        }
      } catch (error: any) {
        console.error('Error fetching shop data:', error);
        toast.error("Không thể tải thông tin gian hàng");
      } finally {
        setIsLoading(false);
      }
    };

    fetchShopData();
  }, [sellerId]);

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <EnhancedNavbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="flex flex-col min-h-screen">
        <EnhancedNavbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">Không tìm thấy gian hàng</h2>
            <p className="text-muted-foreground">Gian hàng này không tồn tại hoặc đã bị xóa.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <EnhancedNavbar />
      
      <main className="flex-1 container py-8">
        {/* Shop Header */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <Avatar className="h-24 w-24 md:h-32 md:w-32">
                <AvatarImage src={seller.avatar} />
                <AvatarFallback className="text-2xl">
                  <Store className="h-12 w-12" />
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold mb-2">
                      {seller.full_name}
                    </h1>
                    {seller.shop_description && (
                      <p className="text-muted-foreground mb-3">
                        {seller.shop_description}
                      </p>
                    )}
                  </div>
                  <Button onClick={() => navigate(`/chat?seller=${sellerId}`)}>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Nhắn tin
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm">
                      <strong>{seller.seller_rating || 5.0}</strong> Đánh giá
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Package className="h-4 w-4 text-primary" />
                    <span className="text-sm">
                      <strong>{products.length}</strong> Sản phẩm
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MessageCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">
                      Phản hồi: <strong>{seller.response_rate || 95}%</strong>
                    </span>
                  </div>
                </div>

                {(seller.phone || seller.address) && (
                  <div className="space-y-2 text-sm text-muted-foreground">
                    {seller.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4" />
                        <span>{seller.phone}</span>
                      </div>
                    )}
                    {seller.address && (
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4" />
                        <span>{seller.address}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <Package className="h-6 w-6 mr-2" />
            Sản phẩm ({products.length})
          </h2>
        </div>

        {products.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Chưa có sản phẩm</h3>
              <p className="text-muted-foreground">
                Gian hàng này chưa có sản phẩm nào.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <Link to={`/product/${product.id}`}>
                  <div className="aspect-square overflow-hidden bg-gray-100">
                    <img
                      src={product.image || '/placeholder.svg'}
                      alt={product.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </div>
                </Link>
                <CardContent className="p-4">
                  <Link to={`/product/${product.id}`}>
                    <h3 className="font-semibold mb-2 line-clamp-2 hover:text-primary">
                      {product.title}
                    </h3>
                  </Link>
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-bold text-primary">
                      {new Intl.NumberFormat('vi-VN', { 
                        style: 'currency', 
                        currency: 'VND',
                        maximumFractionDigits: 0 
                      }).format(product.price)}
                    </div>
                    <Button size="sm" asChild>
                      <Link to={`/product/${product.id}`}>
                        <ShoppingCart className="h-4 w-4 mr-1" />
                        Xem
                      </Link>
                    </Button>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground mt-2">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                    <span>{product.average_rating || 5.0}</span>
                    <span className="mx-2">•</span>
                    <span>Đã bán: {product.purchases || 0}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <MobileBottomNav />
      <Footer />
    </div>
  );
};

export default ShopPage;
