
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Check, ArrowLeft, Clock, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import QRPayment from "@/components/payment/QRPayment";

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

  // Query để kiểm tra trạng thái thanh toán real-time
  const { data: order, isLoading, error } = useQuery({
    queryKey: ['order-status', orderId],
    queryFn: async () => {
      if (!orderId) return null;
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
            product_type
          )
        `)
        .eq('id', orderId)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!orderId,
    refetchInterval: 5000, // Kiểm tra mỗi 5 giây
  });

  useEffect(() => {
    document.title = "Thanh toán đơn hàng | DigitalMarket";
  }, []);

  // Tự động chuyển sang trạng thái completed khi order đã paid
  useEffect(() => {
    if (order?.status === 'paid' && paymentStatus !== 'completed') {
      setPaymentStatus('completed');
      toast({
        title: "Thanh toán thành công!",
        description: "Đơn hàng của bạn đã được xác nhận thanh toán tự động.",
      });
    }
  }, [order?.status, paymentStatus, toast]);

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
        description: "Chúng tôi đã nhận được yêu cầu xác nhận thanh toán của bạn. Admin sẽ xử lý trong ít phút.",
      });
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

  // Payment completed screen
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
                Sản phẩm sẽ được gửi đến bạn trong ít phút.
              </p>
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

  // Error handling - order not found
  if (error || !order) {
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
                Đơn hàng với ID <code className="bg-red-100 px-2 py-1 rounded">{orderId}</code> không tồn tại hoặc đã bị xóa.
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
      
      <main className="flex-1 container py-12">
        <div className="max-w-3xl mx-auto">
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
          
          {/* Order Summary */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Chi tiết đơn hàng</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4 pb-4 border-b">
                  <div className="h-16 w-16 bg-gray-100 rounded overflow-hidden">
                    <img 
                      src={order.products?.image || '/placeholder.svg'} 
                      alt={order.products?.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{order.products?.title}</h3>
                    <p className="text-sm text-gray-500">
                      Người bán: {order.products?.seller_name}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span>Email người mua:</span>
                    <span className="font-medium">{user?.email}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Mã đơn hàng:</span>
                    <code className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{orderId}</code>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Loại sản phẩm:</span>
                    <span className="font-medium">
                      {order.products?.product_type === 'file_download' ? 'File tải về' : 
                       order.products?.product_type === 'license_key_delivery' ? 'Mã kích hoạt' :
                       'Dịch vụ khác'}
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center text-lg font-bold py-2 border-t">
                  <span>Tổng thanh toán:</span>
                  <span className="text-marketplace-primary">{formatPrice(order.products?.price || 0)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* QR Payment Component */}
          <QRPayment
            orderId={orderId || ''}
            amount={order.products?.price || 0}
            onManualConfirmation={handleManualPaymentConfirmation}
          />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Payment;
