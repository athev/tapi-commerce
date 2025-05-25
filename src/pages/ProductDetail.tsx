import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Product } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ProductTypeOrderForm from "@/components/products/ProductTypeOrderForm";
import ProductImageGallery from "@/components/products/ProductImageGallery";
import ProductReviews from "@/components/products/ProductReviews";
import SellerInfo from "@/components/products/SellerInfo";
import RelatedProducts from "@/components/products/RelatedProducts";
import ProductHeader from "@/components/products/ProductHeader";
import ProductTabs from "@/components/products/ProductTabs";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft } from "lucide-react";
const ProductDetail = () => {
  const {
    id
  } = useParams();
  const {
    user,
    isOnline
  } = useAuth();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);
  const {
    data: product,
    isLoading,
    isError
  } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      if (!isOnline) {
        throw new Error("Không có kết nối internet");
      }
      const {
        data,
        error
      } = await supabase.from('products').select('*').eq('id', id).single();
      if (error) {
        console.error("Error fetching product:", error);
        throw error;
      }
      return data as Product;
    },
    retry: false
  });

  // Check if user has already purchased this product (only for file_download type)
  const {
    data: existingOrder
  } = useQuery({
    queryKey: ['user-order', id, user?.id],
    queryFn: async () => {
      if (!user?.id || !id || !product) return null;

      // Only check for existing orders for file_download type
      if (product.product_type !== 'file_download') {
        return null;
      }
      const {
        data,
        error
      } = await supabase.from('orders').select('*').eq('user_id', user.id).eq('product_id', id).eq('status', 'paid').single();
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      return data;
    },
    enabled: !!user?.id && !!id && !!product
  });
  useEffect(() => {
    // Only set hasPurchased to true for file_download products
    if (existingOrder && product?.product_type === 'file_download') {
      setHasPurchased(true);
    } else {
      setHasPurchased(false);
    }
  }, [existingOrder, product?.product_type]);
  const handlePurchase = async (buyerData?: any) => {
    if (!user) {
      toast({
        title: "Vui lòng đăng nhập",
        description: "Bạn cần đăng nhập để mua sản phẩm này",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }
    if (!product) return;
    setIsProcessing(true);
    try {
      console.log('Creating order with data:', {
        user_id: user.id,
        product_id: product.id,
        buyer_email: buyerData?.email || user.email,
        buyer_data: buyerData,
        product_info: {
          seller_id: product.seller_id,
          price: product.price,
          title: product.title
        }
      });
      const {
        data: order,
        error
      } = await supabase.from('orders').insert([{
        user_id: user.id,
        product_id: product.id,
        status: 'paid',
        buyer_email: buyerData?.email || user.email || '',
        buyer_data: buyerData || null,
        delivery_status: 'pending'
      }]).select().single();
      if (error) {
        console.error('Error creating order:', error);
        throw error;
      }
      console.log('Order created successfully:', order);

      // Only set hasPurchased for file_download products
      if (product.product_type === 'file_download') {
        setHasPurchased(true);
      }
      toast({
        title: "Đặt hàng thành công!",
        description: "Cảm ơn bạn đã mua sản phẩm. Thông tin sẽ được xử lý ngay."
      });
    } catch (error) {
      console.error('Purchase error:', error);
      toast({
        title: "Lỗi thanh toán",
        description: "Có lỗi xảy ra khi xử lý đơn hàng. Vui lòng thử lại.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-marketplace-primary"></div>
      </div>
    );
  }
  if (isError) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Lỗi</CardTitle>
            <CardDescription>Không thể tải sản phẩm. Vui lòng thử lại sau.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/')}>Về trang chủ</Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="bg-white border-b">
          <div className="container py-2 lg:py-3">
            <div className="flex items-center space-x-2 text-xs lg:text-sm text-gray-600">
              <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="p-0 h-auto text-xs lg:text-sm">
                <ArrowLeft className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
                Trang chủ
              </Button>
              <span>/</span>
              <span className="hidden sm:inline">{product?.category}</span>
              <span className="hidden sm:inline">/</span>
              <span className="text-gray-900 font-medium truncate text-xs lg:text-sm">{product?.title}</span>
            </div>
          </div>
        </div>

        {/* Main Product Section - Mobile Optimized */}
        <div className="container py-4 lg:py-6 xl:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 xl:gap-12">
            {/* Left - Product Images */}
            <div className="lg:col-span-1">
              <div className="sticky top-4 lg:top-6">
                <ProductImageGallery 
                  images={product?.image ? [product.image] : []} 
                  title={product?.title || ''} 
                />
              </div>
            </div>
            
            {/* Right - Product Info and Purchase */}
            <div className="lg:col-span-1">
              <div className="space-y-4 lg:space-y-6">
                {/* Product Information */}
                <ProductHeader 
                  title={product?.title || ''} 
                  price={product?.price || 0} 
                  category={product?.category || ''} 
                  productType={product?.product_type || 'file_download'} 
                  purchases={product?.purchases || 0} 
                  inStock={product?.in_stock || 0} 
                  sellerName={product?.seller_name || ''} 
                />
                
                {/* Purchase Section - Mobile Optimized */}
                <div className="bg-white rounded-lg shadow-md lg:shadow-lg border border-gray-200 overflow-hidden">
                  <div className="p-4 lg:p-6">
                    <ProductTypeOrderForm 
                      productType={product?.product_type || 'file_download'} 
                      onPurchase={handlePurchase} 
                      isProcessing={isProcessing} 
                      hasPurchased={hasPurchased} 
                      product={product} 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="bg-white border-t">
          <div className="container py-6 lg:py-8 xl:py-12">
            <ProductTabs 
              description={product?.description || ''} 
              productType={product?.product_type || 'file_download'} 
            />
          </div>
        </div>

        {/* Seller Info */}
        <div className="container py-4 lg:py-6 xl:py-8">
          <SellerInfo 
            sellerId={product?.seller_id || ''} 
            sellerName={product?.seller_name || ''} 
          />
        </div>

        {/* Reviews Section */}
        <div className="bg-white border-t">
          <div className="container py-6 lg:py-8 xl:py-12">
            <ProductReviews 
              reviews={[]} 
              averageRating={4.8} 
              totalReviews={156} 
            />
          </div>
        </div>

        {/* Related Products */}
        <div className="container py-4 lg:py-6 xl:py-8">
          <RelatedProducts 
            currentProductId={id || ''} 
            category={product?.category || ''} 
          />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ProductDetail;
