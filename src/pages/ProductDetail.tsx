import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, ShoppingBag, Download } from 'lucide-react';
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
import ProductPriceCard from '@/components/products/ProductPriceCard';
import ProductCTAButtons from '@/components/products/ProductCTAButtons';
import ProductPurchaseForm from '@/components/products/ProductPurchaseForm';
import StickyBottomButton from '@/components/products/StickyBottomButton';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import { mockProducts } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [selectedVariantName, setSelectedVariantName] = useState<string>('');

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

  const handleBuyNow = () => {
    if (!user) {
      toast({
        title: "Cần đăng nhập",
        description: "Vui lòng đăng nhập để mua sản phẩm",
        variant: "destructive"
      });
      return;
    }

    // For products that don't need form, go straight to purchase
    const needsForm = ['upgrade_account_no_pass', 'upgrade_account_with_pass'].includes(product.product_type);
    
    if (needsForm) {
      setShowPurchaseForm(true);
    } else {
      handleConfirmPurchase({});
    }
  };

  const handleConfirmPurchase = async (buyerData: any) => {
    try {
      setIsProcessing(true);
      
      // Calculate actual price based on variant
      const actualPrice = currentPrice || product.price;
      
      const orderData = {
        user_id: user.id,
        product_id: product.id,
        buyer_data: buyerData || {},
        buyer_email: buyerData?.email || user.email,
        variant_id: selectedVariantId,
        bank_amount: actualPrice,
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

      // Navigate to payment
      if (order && order.id) {
        navigate(`/payment/${order.id}`);
      }
    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tạo đơn hàng",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePriceChange = (price: number, variantId: string | null, variantName?: string) => {
    setCurrentPrice(price);
    setSelectedVariantId(variantId);
    if (variantName) {
      setSelectedVariantName(variantName);
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
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Single Column Layout */}
        <div className="space-y-6">
          {/* Product Image */}
          <ProductImageGallery images={[product.image || '/placeholder.svg']} />

          {/* Product Header */}
          <div className="space-y-3">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              {product.category}
            </Badge>
            
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground leading-tight">
              {product.title}
            </h1>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                <span>4.8 (124)</span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center">
                <ShoppingBag className="h-4 w-4 mr-1" />
                <span>{product.purchases || 0} lượt mua</span>
              </div>
            </div>
          </div>

          {/* After Purchase UI for file_download */}
          {hasPurchased && product.product_type === 'file_download' ? (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Download className="h-6 w-6 text-green-600" />
                  <h3 className="font-bold text-green-900 text-lg">Sản phẩm đã mua</h3>
                </div>
                <p className="text-sm text-green-800 mb-4">
                  Bạn có thể tải xuống file ngay bây giờ.
                </p>
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700 h-12 text-base font-bold"
                  onClick={() => {
                    if (product?.file_url) {
                      window.open(product.file_url, '_blank');
                    } else {
                      const link = document.createElement('a');
                      link.href = 'data:text/plain;charset=utf-8,Sample Digital Product Content';
                      link.download = `${product?.title || 'product'}.txt`;
                      link.click();
                    }
                  }}
                >
                  <Download className="h-5 w-5 mr-2" /> Tải xuống file
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Price Card with Variants */}
              <Card>
                <CardContent className="p-6">
                  <ProductPriceCard 
                    product={product} 
                    onPriceChange={handlePriceChange}
                  />
                </CardContent>
              </Card>

              {/* CTA Buttons */}
              <ProductCTAButtons
                currentPrice={currentPrice || product.price}
                onBuyNow={handleBuyNow}
                isProcessing={isProcessing}
                hasPurchased={hasPurchased}
                productType={product.product_type || 'file_download'}
              />
            </>
          )}

          {/* Seller Info */}
          <SellerInfo
            sellerId={product.seller_id}
            sellerName={product.seller_name}
            productId={product.id}
            productTitle={product.title}
          />
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

      {/* Purchase Form (Progressive Disclosure) */}
      <ProductPurchaseForm
        isOpen={showPurchaseForm}
        onClose={() => setShowPurchaseForm(false)}
        productType={product.product_type || 'file_download'}
        product={product}
        currentPrice={currentPrice || product.price}
        selectedVariantId={selectedVariantId}
        selectedVariantName={selectedVariantName}
        onConfirm={handleConfirmPurchase}
        isProcessing={isProcessing}
      />

      {/* Sticky Bottom Button for Mobile */}
      {isMobile && (
        <StickyBottomButton
          onBuyNow={handleBuyNow}
          isProcessing={isProcessing}
          hasPurchased={hasPurchased}
          productType={product.product_type || 'file_download'}
          price={currentPrice || product.price}
        />
      )}

      <Footer />
    </div>
  );
};

export default ProductDetail;
