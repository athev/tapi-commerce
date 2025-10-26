import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Check, ArrowLeft, Clock, AlertCircle, Download, Key, UserPlus, MessageCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import QRPayment from "@/components/payment/QRPayment";
import ManualConfirmation from "@/components/payment/ManualConfirmation";
import OrderSupportChatButton from "@/components/chat/OrderSupportChatButton";

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', { 
    style: 'currency', 
    currency: 'VND',
    maximumFractionDigits: 0 
  }).format(price);
};

const Payment = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isConfirmingPayment, setIsConfirmingPayment] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'confirming' | 'completed'>('pending');
  const [showManualButton, setShowManualButton] = useState(false);

  // Query để kiểm tra trạng thái thanh toán real-time với interval ngắn hơn
  const { data: order, isLoading, error } = useQuery({
    queryKey: ['order-status', orderId],
    queryFn: async () => {
      if (!orderId) {
        console.log('No orderId provided');
        return null;
      }
      
      console.log('Fetching order:', orderId);
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          products (
            id,
            title,
            price,
            image,
            seller_name,
            product_type,
            file_url,
            seller_id
          ),
          product_variants (
            id,
            variant_name,
            price
          ),
          casso_transactions!left (
            description,
            transaction_id,
            amount
          )
        `)
        .eq('id', orderId)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching order:', error);
        throw error;
      }
      
      console.log('Fetched order data:', data);
      return data;
    },
    enabled: !!orderId,
    refetchInterval: 3000, // Kiểm tra mỗi 3 giây thay vì 5 giây
    retry: 3,
    retryDelay: 1000,
  });

  // Calculate actual price (variant price takes priority)
  const actualPrice = order?.product_variants?.price || order?.products?.price || 0;

  useEffect(() => {
    document.title = "Thanh toán đơn hàng | DigitalMarket";
  }, []);

  // Show manual button after 5 minutes if payment not confirmed
  useEffect(() => {
    if (order?.status === 'pending' && !order?.manual_payment_requested) {
      const timer = setTimeout(() => {
        setShowManualButton(true);
      }, 5 * 60 * 1000); // 5 minutes

      return () => clearTimeout(timer);
    }
  }, [order?.status, order?.manual_payment_requested]);

  // Tự động chuyển sang trạng thái completed khi order đã paid
  useEffect(() => {
    if (order?.status === 'paid' && paymentStatus !== 'completed') {
      setPaymentStatus('completed');
      
      // Show different toast messages based on delivery status
      if (order.delivery_status === 'delivered') {
        toast({
          title: "Thanh toán và giao hàng thành công! 🎉",
          description: "Đơn hàng đã được xác nhận và giao hàng tự động. Kiểm tra email để nhận sản phẩm.",
        });
      } else {
        toast({
          title: "Thanh toán thành công! ✅",
          description: "Đơn hàng của bạn đã được xác nhận thanh toán tự động.",
        });
      }
    }
  }, [order?.status, order?.delivery_status, paymentStatus, toast]);

  const handleManualPaymentConfirmation = async () => {
    setIsConfirmingPayment(true);

    try {
      if (orderId && user?.id) {
        const { error } = await supabase
          .from('orders')
          .update({ 
            manual_payment_requested: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', orderId)
          .eq('user_id', user.id);
        
        if (error) throw error;
      }

      toast({
        title: "Yêu cầu đã được gửi",
        description: "Chúng tôi đã nhận được yêu cầu xác nhận thanh toán của bạn. Seller sẽ xử lý trong ít phút.",
      });
      
      setShowManualButton(false);
    } catch (error) {
      console.error('Manual payment confirmation error:', error);
      toast({
        title: "Lỗi gửi yêu cầu",
        description: "Có lỗi xảy ra. Vui lòng thử lại hoặc liên hệ hỗ trợ.",
        variant: "destructive"
      });
    } finally {
      setIsConfirmingPayment(false);
    }
  };

  const getDeliveryStatusIcon = (deliveryStatus: string, productType: string) => {
    if (deliveryStatus === 'delivered') {
      switch (productType) {
        case 'file_download':
          return <Download className="h-5 w-5 text-green-600" />;
        case 'license_key_delivery':
          return <Key className="h-5 w-5 text-green-600" />;
        case 'shared_account':
        case 'upgrade_account_no_pass':
        case 'upgrade_account_with_pass':
          return <UserPlus className="h-5 w-5 text-green-600" />;
        default:
          return <Check className="h-5 w-5 text-green-600" />;
      }
    }
    return <Clock className="h-5 w-5 text-yellow-600" />;
  };

  const getDeliveryStatusText = (deliveryStatus: string, productType: string) => {
    if (deliveryStatus === 'delivered') {
      switch (productType) {
        case 'file_download':
          return 'Đã gửi file qua email';
        case 'license_key_delivery':
          return 'Đã gửi license key';
        case 'shared_account':
          return 'Đã gửi thông tin tài khoản';
        case 'upgrade_account_no_pass':
        case 'upgrade_account_with_pass':
          return 'Đã xử lý nâng cấp tài khoản';
        default:
          return 'Đã giao hàng thành công';
      }
    } else if (deliveryStatus === 'processing') {
      return 'Đang xử lý giao hàng';
    }
    return 'Chờ xử lý';
  };

  // Payment completed screen with enhanced delivery info
  if (paymentStatus === 'completed' || order?.status === 'paid') {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        
        <main className="flex-1 container py-12">
          <div className="max-w-3xl mx-auto">
            <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-green-800 mb-2">Thanh toán thành công!</h2>
              <p className="text-green-700 mb-6">
                Đơn hàng của bạn đã được xác nhận và đang được xử lý. 
              </p>

              {/* Delivery Status Information */}
              {order?.delivery_status && (
                <div className="bg-white rounded-lg p-4 mb-6 border border-green-200">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    {getDeliveryStatusIcon(order.delivery_status, order.products?.product_type)}
                    <span className="font-medium">
                      {getDeliveryStatusText(order.delivery_status, order.products?.product_type)}
                    </span>
                  </div>
                  
                  {order.delivery_notes && (
                    <div className="text-sm text-gray-600 mt-2 p-2 bg-gray-50 rounded">
                      <strong>Chi tiết:</strong> {order.delivery_notes}
                    </div>
                  )}

                  {order.delivery_status === 'delivered' && order.products?.product_type === 'file_download' && (
                    <p className="text-sm text-green-600 mt-2">
                      📧 Kiểm tra email để tải xuống sản phẩm
                    </p>
                  )}

                  {order.delivery_status === 'processing' && (
                    <p className="text-sm text-yellow-600 mt-2">
                      ⏳ Sản phẩm đang được xử lý thủ công, chúng tôi sẽ liên hệ sớm
                    </p>
                  )}
                </div>
              )}

              {/* Chat with seller button */}
              {order?.products?.seller_id && (
                <div className="mb-6">
                  <OrderSupportChatButton
                    order={order}
                    sellerId={order.products.seller_id}
                    className="w-full sm:w-auto"
                    variant="default"
                  />
                </div>
              )}

              {order?.payment_verified_at && (
                <div className="text-sm text-green-600 mb-4">
                  Thanh toán được xác nhận lúc: {new Date(order.payment_verified_at).toLocaleString('vi-VN')}
                </div>
              )}

              <div className="space-y-3">
                <Button 
                  className="bg-marketplace-primary hover:bg-marketplace-primary/90" 
                  onClick={() => navigate(`/product/${order?.product_id}`)}
                >
                  Về trang sản phẩm
                </Button>
                <br />
                <Button variant="outline" onClick={() => navigate('/my-purchases')}>
                  Xem đơn hàng của tôi
                </Button>
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 container py-12">
          <div className="max-w-3xl mx-auto">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Show manual payment requested state
  if (order?.manual_payment_requested) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        
        <main className="flex-1 container py-12">
          <div className="max-w-3xl mx-auto">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
              <h2 className="text-2xl font-bold text-yellow-800 mb-2">Đang chờ xác nhận thanh toán</h2>
              <p className="text-yellow-700 mb-6">
                Yêu cầu xác nhận thanh toán thủ công đã được gửi. Seller sẽ xử lý trong ít phút.
              </p>
              
              <div className="bg-white rounded-lg p-4 mb-6 border border-yellow-200">
                <h3 className="font-medium mb-2">Thông tin đơn hàng</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Mã đơn: {orderId?.substring(0, 8).toUpperCase()}</p>
                  <p>Sản phẩm: {order?.products?.title}</p>
                  {order?.product_variants && (
                    <p>Gói: {order.product_variants.variant_name}</p>
                  )}
                  <p>Giá: {formatPrice(actualPrice)}</p>
                </div>
              </div>

              <div className="space-y-3">
                <Button 
                  variant="outline"
                  onClick={() => navigate(`/product/${order?.product_id}`)}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Về trang sản phẩm
                </Button>
                <br />
                <Button 
                  onClick={() => navigate('/my-purchases')}
                  className="bg-marketplace-primary hover:bg-marketplace-primary/90"
                >
                  Xem đơn hàng của tôi
                </Button>
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }

  // Error handling - order not found
  if (error || !order) {
    console.error('Order error or not found:', { error, order, orderId });
    
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        
        <main className="flex-1 container py-12">
          <div className="max-w-3xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-red-800 mb-2">Không tìm thấy đơn hàng</h2>
              <p className="text-red-700 mb-6">
                {error ? 
                  `Có lỗi xảy ra khi tải đơn hàng: ${error.message}` :
                  `Đơn hàng với ID ${orderId} không tồn tại hoặc đã bị xóa.`
                }
              </p>
              <div className="space-y-3">
                <Button 
                  onClick={() => navigate('/')}
                  variant="outline"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Về trang chủ
                </Button>
                <br />
                <Button 
                  onClick={() => navigate('/my-purchases')}
                  className="bg-marketplace-primary hover:bg-marketplace-primary/90"
                >
                  Xem đơn hàng của tôi
                </Button>
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }

  // Main payment screen
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 container py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center mb-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate(`/product/${order.product_id}`)}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
            <h1 className="text-3xl font-bold">Thanh toán đơn hàng</h1>
          </div>
          
          {/* 2-Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Payment Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Enhanced Payment Notice */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold text-blue-900">Thanh toán tự động & nhanh chóng</span>
                </div>
                <p className="text-blue-700 text-sm">
                  Hệ thống sẽ tự động xác nhận thanh toán và giao hàng ngay khi nhận được chuyển khoản. 
                  {order?.products?.product_type === 'file_download' && 
                    ' File sẽ được gửi qua email tự động trong 1-2 phút.'}
                  {order?.products?.product_type === 'license_key_delivery' && 
                    ' License key sẽ được gửi qua email tự động trong 1-2 phút.'}
                </p>
              </div>

              {/* Order Details Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin đơn hàng</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Email người mua:</span>
                      <span className="font-medium">{user?.email}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Mã đơn hàng:</span>
                      <code className="font-mono text-xs bg-muted px-2 py-1 rounded">{orderId?.substring(0, 13).toUpperCase()}</code>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Loại sản phẩm:</span>
                      <span className="font-medium">
                        {order.products?.product_type === 'file_download' ? 'File tải về' : 
                         order.products?.product_type === 'license_key_delivery' ? 'Mã kích hoạt' :
                         order.products?.product_type === 'shared_account' ? 'Tài khoản chia sẻ' :
                         order.products?.product_type === 'upgrade_account_no_pass' ? 'Nâng cấp tài khoản' :
                         order.products?.product_type === 'upgrade_account_with_pass' ? 'Nâng cấp tài khoản có mật khẩu' :
                         'Dịch vụ khác'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* QR Payment Component */}
              <QRPayment
                orderId={orderId || ''}
                amount={actualPrice}
                onManualConfirmation={handleManualPaymentConfirmation}
                actualDescription={order.casso_transactions?.[0]?.description}
              />
              
              {/* Manual Confirmation Button */}
              {(showManualButton || order?.manual_payment_requested) && (
                <ManualConfirmation
                  showManualButton={showManualButton && !order?.manual_payment_requested}
                  onManualConfirmation={() => setShowManualButton(false)}
                  orderId={orderId || ''}
                />
              )}
            </div>

            {/* Right Column - Order Summary (Sticky) */}
            <div className="lg:col-span-1">
              <div className="sticky top-4">
                <Card className="border-2">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">Tóm tắt đơn hàng</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Product Info */}
                    <div className="flex gap-3 pb-4 border-b">
                      <div className="h-20 w-20 bg-muted rounded overflow-hidden flex-shrink-0">
                        <img 
                          src={order.products?.image || '/placeholder.svg'} 
                          alt={order.products?.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm line-clamp-2 mb-1">{order.products?.title}</h4>
                        <p className="text-xs text-muted-foreground">
                          Người bán: {order.products?.seller_name}
                        </p>
                      </div>
                    </div>

                    {/* Price Breakdown */}
                    <div className="space-y-3">
                      {order?.product_variants && (
                        <div className="flex justify-between text-sm pb-2 border-b">
                          <span className="text-muted-foreground">Gói đã chọn:</span>
                          <span className="font-medium">{order.product_variants.variant_name}</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tạm tính:</span>
                        <span className="font-medium">{formatPrice(actualPrice)}</span>
                      </div>
                      
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Giảm giá:</span>
                        <span className="font-medium">-{formatPrice(0)}</span>
                      </div>
                      
                      <div className="h-px bg-border"></div>
                      
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-base">Tổng thanh toán:</span>
                        <span className="font-bold text-2xl text-destructive">
                          {formatPrice(actualPrice)}
                        </span>
                      </div>
                    </div>

                    {/* Trust Info */}
                    <div className="bg-blue-50 rounded-lg p-3 space-y-1">
                      <p className="text-xs text-blue-800 flex items-center gap-1">
                        ✓ Thanh toán an toàn & bảo mật
                      </p>
                      <p className="text-xs text-blue-800 flex items-center gap-1">
                        ✓ Giao hàng tự động trong 1-2 phút
                      </p>
                      <p className="text-xs text-blue-800 flex items-center gap-1">
                        ✓ Hỗ trợ 24/7
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Payment;
