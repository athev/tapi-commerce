import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ShoppingCart, 
  Heart,
  Star, 
  Check, 
  ShieldCheck, 
  Clock,
  Info,
  Download
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductGrid from "@/components/products/ProductGrid";
import { useAuth } from "@/context/AuthContext";
import { supabase, Product, Order, mockProducts } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

// Format price function
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', { 
    style: 'currency', 
    currency: 'VND',
    maximumFractionDigits: 0 
  }).format(price);
};

const ProductDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch product details with improved error handling
  const { data: product, isLoading: isLoadingProduct } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) throw error;
        return data as Product;
      } catch (error) {
        console.warn('Error fetching product details, using mock data', error);
        
        // Find the product in mock data or create a fallback
        const mockProduct = mockProducts.find(p => p.id === id) || {
          id: id || '1',
          title: 'Ebook: Hướng dẫn đầu tư chứng khoán cho người mới bắt đầu',
          description: 'Cuốn sách điện tử giúp bạn bắt đầu hành trình đầu tư chứng khoán một cách an toàn và hiệu quả.',
          price: 99000,
          image: '/placeholder.svg',
          category: 'Ebook',
          seller_id: 'seller1',
          seller_name: 'Financial Expert',
          file_url: 'https://example.com/sample.pdf',
          in_stock: 999,
          purchases: 124,
          created_at: '2025-04-01T08:30:00Z'
        };
        
        return mockProduct;
      }
    },
    enabled: !!id,
  });

  // Fetch similar products with improved error handling
  const { data: similarProducts } = useQuery({
    queryKey: ['similarProducts', product?.category],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('category', product?.category)
          .neq('id', id)
          .limit(5);
        
        if (error) throw error;
        
        return data as Product[];
      } catch (error) {
        console.warn('Error fetching similar products, using mock data', error);
        
        // Get similar mock products in same category or fallback to first 5 mock products
        const sameCategoryProducts = mockProducts
          .filter(p => p.category === product?.category && p.id !== id)
          .slice(0, 5);
        
        const mockSimilarProducts = sameCategoryProducts.length > 0 
          ? sameCategoryProducts 
          : mockProducts.filter(p => p.id !== id).slice(0, 5);
        
        return mockSimilarProducts;
      }
    },
    enabled: !!product?.category,
  });

  // For development, simulate user purchases
  const mockUserPurchases = ['1', '2']; // Mock purchased product IDs
  const hasPurchased = mockUserPurchases.includes(id || '');

  // Handle purchase - simplified for development
  const handlePurchase = async () => {
    if (!user) {
      toast({
        title: "Vui lòng đăng nhập",
        description: "Bạn cần đăng nhập để mua sản phẩm này",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Simulate order creation
      const orderId = 'order_' + Math.random().toString(36).substr(2, 9);
      
      toast({
        title: "Đặt hàng thành công",
        description: "Vui lòng hoàn tất thanh toán",
      });
      
      // Redirect to payment page
      navigate(`/payment/${orderId}`);
    } catch (error) {
      toast({
        title: "Đặt hàng thất bại",
        description: "Có lỗi xảy ra, vui lòng thử lại",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle download
  const handleDownload = () => {
    if (product?.file_url) {
      window.open(product.file_url, '_blank');
    } else {
      // For demo purposes, create a mock download
      const link = document.createElement('a');
      link.href = 'data:text/plain;charset=utf-8,Sample Digital Product Content';
      link.download = `${product?.title || 'product'}.txt`;
      link.click();
    }
    
    toast({
      title: "Đang tải xuống",
      description: "File của bạn đang được tải xuống",
    });
  };

  useEffect(() => {
    if (product?.title) {
      document.title = product.title + " | DigitalMarket";
    }
  }, [product?.title]);

  if (isLoadingProduct) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 container py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <Skeleton className="aspect-square rounded-lg" />
            <div className="space-y-6">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-10 w-1/4" />
              <Skeleton className="h-5 w-1/2" />
              <div className="pt-4 border-t">
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-8 w-2/3 mt-2" />
              </div>
              <div className="pt-6 space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 container py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Không tìm thấy sản phẩm</h2>
            <p className="mt-2">Sản phẩm này không tồn tại hoặc đã bị xóa.</p>
            <Button onClick={() => navigate('/')} className="mt-4">
              Quay lại trang chủ
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1">
        <div className="container py-8">
          {/* Breadcrumb */}
          <div className="text-sm text-gray-500 mb-6">
            Trang chủ &gt; {product.category} &gt; {product.title}
          </div>
          
          {/* Product Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Product Image */}
            <div>
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img 
                  src={product.image || '/placeholder.svg'} 
                  alt={product.title}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            
            {/* Product Details */}
            <div className="space-y-6">
              <h1 className="text-3xl font-bold">{product.title}</h1>
              
              <div className="flex items-center gap-2">
                <div className="flex">
                  {Array(5).fill(0).map((_, i) => (
                    <Star 
                      key={i}
                      className={`h-5 w-5 ${i < 4 ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                    />
                  ))}
                </div>
                <span className="text-gray-500">({product.purchases || 0} lượt mua)</span>
              </div>
              
              <div className="flex items-end gap-4">
                <div className="text-3xl font-bold text-marketplace-primary">
                  {formatPrice(product.price)}
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-gray-500">
                <Info className="h-4 w-4" />
                <span>Còn lại: {product.in_stock}</span>
              </div>
              
              <div className="pt-4 border-t">
                <h3 className="font-medium mb-2">Người bán:</h3>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{product.seller_name}</span>
                  <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">
                    <Check className="h-3 w-3 mr-1" /> Đã xác thực
                  </Badge>
                </div>
              </div>
              
              <div className="pt-6 space-y-4">
                {hasPurchased ? (
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={handleDownload}
                  >
                    <Download className="h-5 w-5 mr-2" /> Tải xuống
                  </Button>
                ) : (
                  <Button 
                    className="w-full bg-marketplace-primary hover:bg-marketplace-primary/90"
                    onClick={handlePurchase}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-5 w-5 mr-2" /> Mua ngay
                      </>
                    )}
                  </Button>
                )}
                
                <Button variant="outline" className="w-full">
                  <Heart className="h-5 w-5 mr-2" /> Thêm vào yêu thích
                </Button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-marketplace-primary" />
                  <div>
                    <div className="font-medium">Bảo hành</div>
                    <div className="text-sm text-gray-500">30 ngày hoàn tiền nếu không hài lòng</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-marketplace-primary" />
                  <div>
                    <div className="font-medium">Giao hàng</div>
                    <div className="text-sm text-gray-500">Truy cập ngay sau khi thanh toán</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Tabs for description, features, reviews */}
          <Tabs defaultValue="description">
            <TabsList className="w-full justify-start border-b rounded-none p-0 h-12">
              <TabsTrigger 
                value="description"
                className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-marketplace-primary data-[state=active]:shadow-none h-12"
              >
                Mô tả
              </TabsTrigger>
              <TabsTrigger 
                value="reviews" 
                className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-marketplace-primary data-[state=active]:shadow-none h-12"
              >
                Đánh giá
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="description" className="mt-6">
              <div className="prose max-w-none">
                <p>{product.description}</p>
              </div>
            </TabsContent>
            
            <TabsContent value="reviews" className="mt-6">
              <div className="space-y-6">
                <h3 className="text-xl font-semibold">Đánh giá từ người mua</h3>
                
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex-1">
                      <div className="text-3xl font-bold">4/5</div>
                      <div className="flex">
                        {Array(5).fill(0).map((_, i) => (
                          <Star 
                            key={i}
                            className={`h-5 w-5 ${i < 4 ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                          />
                        ))}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">{product.purchases || 0} đánh giá</div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map((star) => (
                          <div key={star} className="flex items-center gap-2">
                            <div className="w-8 text-sm text-gray-500">{star} sao</div>
                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-yellow-400" 
                                style={{ 
                                  width: star === 5 ? "30%" : 
                                         star === 4 ? "60%" : 
                                         star === 3 ? "10%" : "5%" 
                                }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <Button variant="outline">Xem tất cả đánh giá</Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          {/* Similar Products */}
          {similarProducts && similarProducts.length > 0 && (
            <section className="mt-16">
              <h2 className="text-2xl font-bold mb-6">Sản phẩm tương tự</h2>
              <ProductGrid 
                products={similarProducts}
                isLoading={false}
                error={null}
              />
            </section>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ProductDetail;
