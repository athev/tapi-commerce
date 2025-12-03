import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Star, ShoppingBag, Download } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EnhancedNavbar from '@/components/layout/EnhancedNavbar';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import Footer from '@/components/layout/Footer';
import { Breadcrumb } from '@/components/products/Breadcrumb';
import { TrustBadge } from '@/components/ui/TrustBadge';
import ProductImageGallery from '@/components/products/ProductImageGallery';
import ProductDetailsAccordion from '@/components/products/ProductDetailsAccordion';
import ProductReviews from '@/components/products/ProductReviews';
import SellerInfo from '@/components/products/SellerInfo';
import RelatedProducts from '@/components/products/RelatedProducts';
import ProductPriceCard from '@/components/products/ProductPriceCard';
import ProductCTAButtons from '@/components/products/ProductCTAButtons';
import ProductPurchaseForm from '@/components/products/ProductPurchaseForm';
import StickyBottomButton from '@/components/products/StickyBottomButton';
import { PromotionalBanner } from '@/components/products/PromotionalBanner';
import { FreeReturnsSection } from '@/components/products/FreeReturnsSection';
import { LoginIncentiveBanner } from '@/components/products/LoginIncentiveBanner';
import LoginRequiredModal from '@/components/products/LoginRequiredModal';
import TrustBadges from '@/components/products/TrustBadges';
import UrgencyIndicators from '@/components/products/UrgencyIndicators';
import ProductTabs from '@/components/products/ProductTabs';
import ServiceRequestModal from '@/components/products/ServiceRequestModal';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import { mockProducts } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
const ProductDetail = () => {
  const {
    slug,
    id
  } = useParams();
  const navigate = useNavigate();
  const {
    user
  } = useAuth();
  const {
    toast
  } = useToast();
  const isMobile = useIsMobile();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [selectedVariantName, setSelectedVariantName] = useState<string>('');
  const [selectedVariantImage, setSelectedVariantImage] = useState<string | null>(null);
  useEffect(() => {
    // Simulate fetching product data from an API
    // Replace this with your actual data fetching logic
    const timer = setTimeout(() => {
      const foundProduct = mockProducts.find(p => p.id === id);
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

        // Determine if we're using slug or id
        const identifier = slug || id;
        const isUUID = identifier?.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
        
        // Build query based on slug or UUID
        let query = supabase.from('products').select('*');
        if (isUUID) {
          query = query.eq('id', identifier);
        } else {
          query = query.eq('slug', identifier);
        }

        // Try to fetch from Supabase
        const {
          data,
          error
        } = await query.single();
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
          // Set dynamic page title
          document.title = `${data.title} - DigitalMarket`;
        }

        // Check if user has purchased this product
        if (user) {
          const {
            data: orderData
          } = await supabase.from('orders').select('id').eq('user_id', user.id).eq('product_id', id).eq('status', 'paid').single();
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
    const identifier = slug || id;
    if (identifier) {
      fetchProduct();
      
      // Track product view (debounced)
      const viewTimer = setTimeout(async () => {
        try {
          await supabase.rpc('increment_product_views', { product_id: id });
        } catch (error) {
          console.error('Error tracking view:', error);
        }
      }, 3000); // Wait 3 seconds before counting as view
      
      return () => clearTimeout(viewTimer);
    }
  }, [slug, id, user, toast]);
  const handleBuyNow = () => {
    // Check stock first
    if (product.in_stock !== undefined && product.in_stock <= 0) {
      toast({
        title: "Hết hàng",
        description: "Sản phẩm này đã hết hàng. Vui lòng chọn sản phẩm khác.",
        variant: "destructive"
      });
      return;
    }

    if (!user) {
      setShowLoginModal(true);
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
        bank_amount: actualPrice - (buyerData.discount_amount || 0),
        status: 'pending',
        voucher_id: buyerData.voucher_id || null,
        discount_amount: buyerData.discount_amount || 0,
      };
      const {
        data: order,
        error
      } = await supabase.from('orders').insert(orderData).select().single();
      if (error) throw error;
      toast({
        title: "Thành công",
        description: "Đơn hàng đã được tạo. Chuyển đến trang thanh toán..."
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
  const handlePriceChange = (price: number, variantId: string | null, variantName?: string, imageUrl?: string | null) => {
    setCurrentPrice(price);
    setSelectedVariantId(variantId);
    if (variantName) {
      setSelectedVariantName(variantName);
    }
    setSelectedVariantImage(imageUrl || null);
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
    return <div className="min-h-screen bg-gray-50">
        <EnhancedNavbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Đang tải...</div>
        </div>
      </div>;
  }
  if (!product) {
    return <div className="min-h-screen bg-gray-50">
        <EnhancedNavbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Không tìm thấy sản phẩm</div>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-background overflow-x-hidden">
      <Helmet>
        <title>{product.title} - DigitalMarket</title>
        <meta name="description" content={product.description || `Mua ${product.title} chất lượng cao với giá tốt nhất`} />
        <meta property="og:title" content={product.title} />
        <meta property="og:description" content={product.description || `Mua ${product.title} chất lượng cao với giá tốt nhất`} />
        <meta property="og:image" content={product.image || '/placeholder.svg'} />
        <meta property="og:url" content={`${window.location.origin}/product/${product.slug || product.id}`} />
        <meta property="og:type" content="product" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={product.title} />
        <meta name="twitter:description" content={product.description || `Mua ${product.title} chất lượng cao với giá tốt nhất`} />
        <meta name="twitter:image" content={product.image || '/placeholder.svg'} />
      </Helmet>
      <EnhancedNavbar />
      
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 max-w-7xl overflow-x-hidden">
        {/* Breadcrumb - Hide on mobile */}
        <div className="mb-6 overflow-hidden hidden sm:block">
          <Breadcrumb category={product.category} productTitle={product.title} />
        </div>
        
        {/* 2-Column Layout for Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-12">
          {/* Left: Images */}
          <div className="space-y-3 sm:space-y-4 min-w-0">
            <div className="w-full">
              <ProductImageGallery 
                images={[selectedVariantImage || product.image || '/placeholder.svg']} 
                title={product.title}
              />
            </div>
            
          </div>

          {/* Right: Product Info */}
          <div className="space-y-3 min-w-0">
            {/* Title with Product Type Badge */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className="text-[11px] px-2 py-0.5 shrink-0">
                {(() => {
                  const labels = {
                    file_download: 'File tải về',
                  shared_account: 'Tài khoản dùng chung',
                  upgrade_account_no_pass: 'Nâng cấp tài khoản',
                  upgrade_account_with_pass: 'Nâng cấp tài khoản',
                  license_key_delivery: 'Mã kích hoạt',
                  service: 'Dịch vụ'
                };
                return labels[product.product_type as keyof typeof labels] || 'File tải về';
                })()}
              </Badge>
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight">
                {product.title}
              </h1>
            </div>

            {/* Compact Rating Row */}
            <div className="flex items-center gap-2 text-xs border-b pb-1.5">
              <div className="flex">
                {Array(5).fill(0).map((_, i) => (
                  <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="font-semibold">{product.average_rating || 5.0}</span>
              <span className="text-muted-foreground">|</span>
              <span className="text-muted-foreground">
                {product.review_count || 124} đánh giá
              </span>
              <span className="text-muted-foreground">|</span>
              <span className="text-muted-foreground">
                {product.purchases || 0} đã bán
              </span>
              {product.complaint_rate !== undefined && (
                <>
                  <span className="text-muted-foreground">|</span>
                  <span className={product.complaint_rate < 1 ? 'text-green-600 text-xs' : 'text-red-600 text-xs'}>
                    {product.complaint_rate}% khiếu nại
                  </span>
                </>
              )}
            </div>

            {/* After Purchase UI for file_download */}
            {hasPurchased && product.product_type === 'file_download' ? <Card className="bg-success-bg border-success-text/20">
                <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Download className="h-6 w-6 text-green-600" />
                  <h3 className="font-bold text-green-900 text-lg">Sản phẩm đã mua</h3>
                </div>
                <p className="text-sm text-green-800 mb-4">
                  Bạn có thể tải xuống file ngay bây giờ.
                </p>
                <Button className="w-full bg-green-600 hover:bg-green-700 h-12 text-base font-bold" onClick={() => {
                if (product?.file_url) {
                  window.open(product.file_url, '_blank');
                } else {
                  const link = document.createElement('a');
                  link.href = 'data:text/plain;charset=utf-8,Sample Digital Product Content';
                  link.download = `${product?.title || 'product'}.txt`;
                  link.click();
                }
              }}>
                  <Download className="h-5 w-5 mr-2" /> Tải xuống file
                </Button>
                </CardContent>
              </Card> : <>
                {/* Price Card - Enhanced */}
                <Card>
                  <CardContent className="p-3">
                    <ProductPriceCard product={product} onPriceChange={handlePriceChange} />
                    
                    {/* Purchase notification */}
                    {product.in_stock < 20 && (
                      <p className="text-xs text-orange-600 flex items-center gap-1 mt-2">
                        🎉 Nguyễn V*** vừa mua sản phẩm này 2 phút trước
                      </p>
                    )}
                  </CardContent>
                </Card>

              {/* CTA Buttons - Larger & More Prominent */}
              <ProductCTAButtons
                currentPrice={currentPrice || product.price} 
                onBuyNow={handleBuyNow}
                onServiceRequest={() => {
                  if (!user) {
                    setShowLoginModal(true);
                  } else {
                    setShowServiceModal(true);
                  }
                }}
                isProcessing={isProcessing} 
                hasPurchased={hasPurchased} 
                productType={product.product_type || 'file_download'}
                isLoggedIn={!!user}
                productId={product.id}
                onViewChat={(conversationId) => {
                  navigate(`/chat/${conversationId}`);
                }}
                inStock={product.in_stock}
              />
              </>}
          </div>
        </div>

        {/* Login Incentive Banner */}
        <div className="mb-6 sm:mb-8">
          <LoginIncentiveBanner isLoggedIn={!!user} hasPurchased={hasPurchased} />
        </div>

        {/* Promotional Banner */}
        <div className="mb-6 sm:mb-8">
          <PromotionalBanner />
        </div>

        {/* Seller Info - Compact, Above Tabs */}
        <div className="mb-6">
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <SellerInfo 
                sellerId={product.seller_id} 
                sellerName={product.seller_name} 
                productId={product.id} 
                productTitle={product.title}
                totalProducts={product.seller_total_products}
                responseRate={product.seller_response_rate}
              />
            </CardContent>
          </Card>
        </div>

        {/* Product Details Tabs - Full Width with Sticky Header */}
        <div className="mt-8 sm:mt-12">
          <ProductTabs 
            description={product.description || 'Chưa có mô tả cho sản phẩm này.'}
            productType={product.product_type || 'file_download'}
          />
        </div>

        {/* Product Reviews */}
        <div className="mt-8 sm:mt-12">
          <ProductReviews 
            productId={product.id}
            avgRating={product.average_rating || 5.0}
            totalReviews={product.review_count || 0}
          />
        </div>

        {/* Related Products */}
        <div className="mt-8 sm:mt-12 overflow-hidden">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4 md:mb-6">Sản phẩm tương tự</h2>
          <RelatedProducts currentProductId={product.id} category={product.category} />
        </div>
      </div>
      
      {/* Bottom padding for mobile sticky bar */}
      {isMobile && <div className="h-20" />}

      {/* Login Required Modal */}
      <LoginRequiredModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)}
        productTitle={product.title}
      />

      {/* Purchase Form (Progressive Disclosure) */}
      <ProductPurchaseForm isOpen={showPurchaseForm} onClose={() => setShowPurchaseForm(false)} productType={product.product_type || 'file_download'} product={product} currentPrice={currentPrice || product.price} selectedVariantId={selectedVariantId} selectedVariantName={selectedVariantName} onConfirm={handleConfirmPurchase} isProcessing={isProcessing} />

      {/* Service Request Modal */}
      {product && (
        <ServiceRequestModal
          open={showServiceModal}
          onClose={() => setShowServiceModal(false)}
          product={product}
          onSuccess={(conversationId) => navigate(`/chat/${conversationId}`)}
        />
      )}

      {/* Sticky Bottom Button for Mobile */}
      {isMobile && <StickyBottomButton 
        onBuyNow={product.product_type === 'service' ? () => setShowServiceModal(true) : handleBuyNow}
        isProcessing={isProcessing} 
        hasPurchased={hasPurchased} 
        productType={product.product_type || 'file_download'} 
        price={currentPrice || product.price}
        isLoggedIn={!!user}
        inStock={product.in_stock}
      />}

      <MobileBottomNav />
      <Footer />
    </div>;
};
export default ProductDetail;