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
import { Badge } from "@/components/ui/badge";
import ProductTypeOrderForm from "@/components/products/ProductTypeOrderForm";
import ProductImageGallery from "@/components/products/ProductImageGallery";
import ProductReviews from "@/components/products/ProductReviews";
import SellerInfo from "@/components/products/SellerInfo";
import RelatedProducts from "@/components/products/RelatedProducts";
import { Separator } from "@/components/ui/separator";
import { Heart, Share2, Flag, ArrowLeft, Star, Shield, Truck, RotateCcw } from "lucide-react";

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', { 
    style: 'currency', 
    currency: 'VND',
    maximumFractionDigits: 0 
  }).format(price);
};

const getProductTypeLabel = (type: string) => {
  const types = {
    file_download: 'Tải tệp/File tải',
    license_key_delivery: 'Mã kích hoạt',
    shared_account: 'Tài khoản dùng chung',
    upgrade_account_no_pass: 'Nâng cấp không cần mật khẩu',
    upgrade_account_with_pass: 'Nâng cấp có mật khẩu'
  };
  return types[type as keyof typeof types] || type;
};

const ProductDetail = () => {
  const { id } = useParams();
  const { user, isOnline } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

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
    retry: false,
  });

  // Check if user has already purchased this product (only for file_download type)
  const { data: existingOrder } = useQuery({
    queryKey: ['user-order', id, user?.id],
    queryFn: async () => {
      if (!user?.id || !id || !product) return null;
      
      // Only check for existing orders for file_download type
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
    enabled: !!user?.id && !!id && !!product,
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
        variant: "destructive",
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

      const { data: order, error } = await supabase
        .from('orders')
        .insert([
          {
            user_id: user.id,
            product_id: product.id,
            status: 'paid',
            buyer_email: buyerData?.email || user.email || '',
            buyer_data: buyerData || null,
            delivery_status: 'pending'
          }
        ])
        .select()
        .single();

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
        description: "Cảm ơn bạn đã mua sản phẩm. Thông tin sẽ được xử lý ngay.",
      });

    } catch (error) {
      console.error('Purchase error:', error);
      toast({
        title: "Lỗi thanh toán",
        description: "Có lỗi xảy ra khi xử lý đơn hàng. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.title,
        text: product?.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Đã sao chép liên kết",
        description: "Liên kết sản phẩm đã được sao chép vào clipboard",
      });
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
          <div className="container py-3">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/')}
                className="p-0 h-auto"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Trang chủ
              </Button>
              <span>/</span>
              <span>{product?.category}</span>
              <span>/</span>
              <span className="text-gray-900 font-medium">{product?.title}</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column - Images */}
            <div className="lg:col-span-5">
              <ProductImageGallery 
                images={product?.image ? [product.image] : []} 
                title={product?.title || ''} 
              />
            </div>
            
            {/* Middle Column - Product Info */}
            <div className="lg:col-span-4 space-y-6">
              {/* Product Basic Info */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="space-y-4">
                  <div>
                    {product?.product_type && (
                      <Badge variant="outline" className="mb-2">
                        {getProductTypeLabel(product.product_type)}
                      </Badge>
                    )}
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
                      {product?.title}
                    </h1>
                  </div>

                  {/* Rating and Stats */}
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <div className="flex">
                        {Array(5).fill(0).map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <span className="font-medium">4.8</span>
                      <span className="text-gray-500">(156 đánh giá)</span>
                    </div>
                    <span className="text-gray-300">|</span>
                    <span className="text-gray-600">Đã bán: {product?.purchases}</span>
                  </div>

                  {/* Price */}
                  <div className="py-4">
                    <div className="text-3xl font-bold text-marketplace-primary">
                      {product && formatPrice(product.price)}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      Giá đã bao gồm VAT
                    </div>
                  </div>

                  {/* Stock and Actions */}
                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <span className="text-gray-600">Còn lại: </span>
                      <span className="font-medium text-green-600">{product?.in_stock}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsFavorited(!isFavorited)}
                        className={isFavorited ? "text-red-500" : "text-gray-500"}
                      >
                        <Heart className={`h-5 w-5 ${isFavorited ? "fill-current" : ""}`} />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={handleShare}>
                        <Share2 className="h-5 w-5" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Flag className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Guarantees */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold mb-4">Cam kết của chúng tôi</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-sm">
                    <Shield className="h-5 w-5 text-green-600" />
                    <span>Bảo mật thông tin 100%</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <Truck className="h-5 w-5 text-blue-600" />
                    <span>Giao hàng ngay lập tức</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <RotateCcw className="h-5 w-5 text-orange-600" />
                    <span>Hoàn tiền nếu không hài lòng</span>
                  </div>
                </div>
              </div>

              {/* Product Description */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Mô tả sản phẩm</h3>
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {product?.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column - Purchase Form */}
            <div className="lg:col-span-3">
              <div className="sticky top-8 space-y-6">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <ProductTypeOrderForm 
                    productType={product?.product_type || 'file_download'}
                    onPurchase={handlePurchase}
                    isProcessing={isProcessing}
                    hasPurchased={hasPurchased}
                    product={product}
                  />
                </div>

                <SellerInfo 
                  sellerId={product?.seller_id || ''} 
                  sellerName={product?.seller_name || ''}
                />
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="mt-12 space-y-8">
            <Separator />
            
            {/* Reviews Section */}
            <ProductReviews 
              reviews={[]}
              averageRating={4.8}
              totalReviews={156}
            />

            <Separator />
            
            {/* Related Products */}
            <RelatedProducts 
              currentProductId={id || ''}
              category={product?.category || ''}
            />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ProductDetail;
