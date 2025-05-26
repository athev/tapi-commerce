import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Star, Calendar, Eye, ShoppingBag } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductImageGallery from '@/components/products/ProductImageGallery';
import ProductDetailsAccordion from '@/components/products/ProductDetailsAccordion';
import ProductReviews from '@/components/products/ProductReviews';
import SellerInfo from '@/components/products/SellerInfo';
import RelatedProducts from '@/components/products/RelatedProducts';
import ProductTypeOrderForm from '@/components/products/ProductTypeOrderForm';
import StickyBottomButton from '@/components/products/StickyBottomButton';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import { mockProducts } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

const ProductDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);

  useEffect(() => {
    // Simulate fetching product data from an API
    // Replace this with your actual data fetching logic
    const timer = setTimeout(() => {
      const foundProduct = mockProducts.find((p) => p.id === id);
      if (foundProduct) {
        setProduct(foundProduct);
      }
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [id]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        
        // Try to fetch from Supabase
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          console.log('Supabase error, falling back to mock data:', error);
          // Fallback to mock data
          const mockProduct = mockProducts.find(p => p.id === id);
          if (mockProduct) {
            setProduct(mockProduct);
          } else {
            throw new Error('Product not found');
          }
        } else {
          setProduct(data);
        }

        // Check if user has purchased this product
        if (user) {
          const { data: orderData } = await supabase
            .from('orders')
            .select('id')
            .eq('user_id', user.id)
            .eq('product_id', id)
            .eq('status', 'paid')
            .single();

          setHasPurchased(!!orderData);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        toast({
          title: "Lỗi",
          description: "Không thể tải thông tin sản phẩm",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id, user, toast]);

  const handlePurchase = async (buyerData?: any) => {
    if (!user) {
      toast({
        title: "Cần đăng nhập",
        description: "Vui lòng đăng nhập để mua sản phẩm",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsProcessing(true);
      
      const orderData = {
        user_id: user.id,
        product_id: product.id,
        buyer_data: buyerData || {},
        buyer_email: buyerData?.email || user.email,
        status: 'pending'
      };

      const { data: order, error } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Thành công",
        description: "Đơn hàng đã được tạo. Chuyển đến trang thanh toán...",
      });

      // Update purchase status for file_download type
      if (product.product_type === 'file_download') {
        setHasPurchased(true);
      }

      return order;
    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tạo đơn hàng",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Đang tải...</div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Không tìm thấy sản phẩm</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Product Images */}
          <div className="lg:col-span-2">
            <ProductImageGallery images={[product.image || '/placeholder.svg']} />
          </div>

          {/* Right Column - Product Info & Purchase */}
          <div className="space-y-6">
            {/* Product Basic Info */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {product.category}
                  </Badge>
                  
                  <h1 className="text-2xl font-bold text-gray-900">
                    {product.title}
                  </h1>

                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                      <span>4.8 (124 đánh giá)</span>
                    </div>
                    <Separator orientation="vertical" className="h-4" />
                    <div className="flex items-center">
                      <ShoppingBag className="h-4 w-4 mr-1" />
                      <span>{product.purchases || 0} lượt mua</span>
                    </div>
                  </div>

                  <div className="text-3xl font-bold text-marketplace-primary">
                    {formatPrice(product.price)}
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>Ngày tạo: {formatDate(product.created_at)}</span>
                    </div>
                    <div className="flex items-center">
                      <Eye className="h-4 w-4 mr-1" />
                      <span>Còn lại: {product.in_stock || 0}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Purchase Form */}
            <ProductTypeOrderForm
              productType={product.product_type || 'file_download'}
              onPurchase={handlePurchase}
              isProcessing={isProcessing}
              hasPurchased={hasPurchased}
              product={product}
            />

            {/* Seller Info */}
            <SellerInfo
              sellerId={product.seller_id}
              sellerName={product.seller_name}
              productId={product.id}
              productTitle={product.title}
            />
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-12">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="description">Mô tả</TabsTrigger>
              <TabsTrigger value="details">Chi tiết</TabsTrigger>
              <TabsTrigger value="reviews">Đánh giá</TabsTrigger>
            </TabsList>
            
            <TabsContent value="description" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="prose max-w-none">
                    {product.description ? (
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {product.description}
                      </p>
                    ) : (
                      <p className="text-gray-500 italic">Chưa có mô tả cho sản phẩm này.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="details" className="mt-6">
              <ProductDetailsAccordion product={product} />
            </TabsContent>
            
            <TabsContent value="reviews" className="mt-6">
              <ProductReviews productId={product.id} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products */}
        <div className="mt-12">
          <RelatedProducts currentProductId={product.id} category={product.category} />
        </div>
      </div>

      {/* Sticky Bottom Button for Mobile */}
      <StickyBottomButton
        onPurchase={handlePurchase}
        isProcessing={isProcessing}
        hasPurchased={hasPurchased}
        productType={product.product_type || 'file_download'}
        price={product.price}
        productId={product.id}
      />

      <Footer />
    </div>
  );
};

export default ProductDetail;
