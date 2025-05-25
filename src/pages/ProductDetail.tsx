
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
import StickyBottomButton from "@/components/products/StickyBottomButton";
import { ArrowLeft, Star, Shield, Zap, Download } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";

const ProductDetail = () => {
  const { id } = useParams();
  const { user, isOnline } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      if (!isOnline) {
        throw new Error("Không có kết nối internet");
      }
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error("Error fetching product:", error);
        throw error;
      }
      return data as Product;
    },
    retry: false
  });

  const { data: existingOrder } = useQuery({
    queryKey: ['user-order', id, user?.id],
    queryFn: async () => {
      if (!user?.id || !id || !product) return null;

      if (product.product_type !== 'file_download') {
        return null;
      }
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .eq('product_id', id)
        .eq('status', 'paid')
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      return data;
    },
    enabled: !!user?.id && !!id && !!product
  });

  useEffect(() => {
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
      // Create order with pending status
      const { data: order, error } = await supabase
        .from('orders')
        .insert([{
          user_id: user.id,
          product_id: product.id,
          status: 'pending', // Changed from 'paid' to 'pending'
          buyer_email: buyerData?.email || user.email || '',
          buyer_data: buyerData || null,
          delivery_status: 'pending'
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating order:', error);
        throw error;
      }

      toast({
        title: "Đơn hàng đã được tạo!",
        description: "Đang chuyển đến trang thanh toán..."
      });

      // Don't set hasPurchased here - only after payment confirmation
      
    } catch (error) {
      console.error('Purchase error:', error);
      toast({
        title: "Lỗi tạo đơn hàng",
        description: "Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại.",
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="flex-1 pb-20 lg:pb-0">
        {/* Breadcrumb */}
        <div className="bg-white border-b">
          <div className="container py-3">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="p-0 h-auto text-sm">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Trang chủ
              </Button>
              <span>/</span>
              <span className="hidden sm:inline">{product?.category}</span>
              <span className="hidden sm:inline">/</span>
              <span className="text-gray-900 font-medium truncate">{product?.title}</span>
            </div>
          </div>
        </div>

        {/* Main Product Section - 2 Column Layout */}
        <div className="container py-6 lg:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            
            {/* Left Column - Images and Gallery (lg:col-span-7) */}
            <div className="lg:col-span-7">
              <div className="sticky top-6">
                <ProductImageGallery 
                  images={product?.image ? [product.image] : []} 
                  title={product?.title || ''} 
                />
                
                {/* Mobile Product Info */}
                <div className="lg:hidden mt-6">
                  <ProductHeader 
                    title={product?.title || ''} 
                    price={product?.price || 0} 
                    category={product?.category || ''} 
                    productType={product?.product_type || 'file_download'} 
                    purchases={product?.purchases || 0} 
                    inStock={product?.in_stock || 0} 
                    sellerName={product?.seller_name || ''} 
                  />
                </div>
              </div>
            </div>
            
            {/* Right Column - Product Info and Purchase (lg:col-span-5) */}
            <div className="lg:col-span-5">
              <div className="lg:sticky lg:top-6 space-y-6">
                
                {/* Desktop Product Header */}
                <div className="hidden lg:block">
                  <div className="space-y-4">
                    {/* Category and Social Proof */}
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {product?.category}
                      </Badge>
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-orange-100 text-orange-700 border-orange-200">
                          ⭐ Best Seller
                        </Badge>
                      </div>
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
                      {product?.title}
                    </h1>

                    {/* Rating and Reviews */}
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <div className="flex">
                          {Array(5).fill(0).map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        <span className="font-medium">4.8</span>
                        <span className="text-gray-500">(156 đánh giá)</span>
                      </div>
                    </div>

                    {/* Social Proof */}
                    <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                      <p className="text-green-700 text-sm font-medium">
                        🔥 {product?.purchases || 23} người đã mua trong 24h qua
                      </p>
                    </div>

                    {/* Price Section */}
                    <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6 rounded-lg border border-red-200">
                      <div className="space-y-3">
                        <div className="flex items-baseline justify-between">
                          <div>
                            <div className="text-3xl font-bold text-red-600">
                              {formatPrice(product?.price || 0)}
                            </div>
                            <div className="text-sm text-red-500 line-through">
                              {formatPrice((product?.price || 0) * 1.3)}
                            </div>
                          </div>
                          <Badge className="bg-red-500 text-white">
                            Giảm 30% hôm nay
                          </Badge>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-green-600 font-medium">
                              Còn {product?.in_stock || 999} sản phẩm
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Key Benefits */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-gray-900">Quyền lợi khi mua:</h3>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3">
                          <Download className="h-4 w-4 text-blue-600 flex-shrink-0" />
                          <span className="text-gray-700 text-sm">Tải về ngay lập tức sau thanh toán</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Shield className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <span className="text-gray-700 text-sm">Bảo mật thông tin 100%</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Zap className="h-4 w-4 text-orange-600 flex-shrink-0" />
                          <span className="text-gray-700 text-sm">Hỗ trợ 24/7</span>
                        </div>
                      </div>
                    </div>

                    {/* Seller Info */}
                    <div className="border-t pt-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-marketplace-primary rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {product?.seller_name?.charAt(0) || 'S'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{product?.seller_name}</p>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                              ✓ Đã xác minh
                            </Badge>
                            <span className="text-xs text-gray-500">Phản hồi trong 2h</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Purchase Section */}
                <Card className="shadow-lg border-gray-200">
                  <CardContent className="p-6">
                    <ProductTypeOrderForm 
                      productType={product?.product_type || 'file_download'} 
                      onPurchase={handlePurchase} 
                      isProcessing={isProcessing} 
                      hasPurchased={hasPurchased} 
                      product={product} 
                    />
                  </CardContent>
                </Card>

                {/* Trust Signals */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-gray-900">30K+</div>
                      <div className="text-xs text-gray-600">Khách hàng</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-gray-900">4.8/5</div>
                      <div className="text-xs text-gray-600">Đánh giá</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-gray-900">24/7</div>
                      <div className="text-xs text-gray-600">Hỗ trợ</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs - Full Width */}
        <div className="bg-white border-t">
          <div className="container py-8">
            <ProductTabs 
              description={product?.description || ''} 
              productType={product?.product_type || 'file_download'} 
            />
          </div>
        </div>

        {/* Seller Info Section */}
        <div className="container py-6">
          <SellerInfo 
            sellerId={product?.seller_id || ''} 
            sellerName={product?.seller_name || ''} 
          />
        </div>

        {/* Reviews Section */}
        <div className="bg-white border-t">
          <div className="container py-8">
            <ProductReviews 
              reviews={[]} 
              averageRating={4.8} 
              totalReviews={156} 
            />
          </div>
        </div>

        {/* Related Products */}
        <div className="container py-6">
          <RelatedProducts 
            currentProductId={id || ''} 
            category={product?.category || ''} 
          />
        </div>
      </main>

      {/* Sticky Bottom Button for Mobile */}
      <StickyBottomButton
        onPurchase={() => handlePurchase()}
        isProcessing={isProcessing}
        hasPurchased={hasPurchased}
        productType={product?.product_type || 'file_download'}
        price={product?.price || 0}
      />
      
      <Footer />
    </div>
  );
};

export default ProductDetail;
