
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Check, ArrowLeft, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', { 
    style: 'currency', 
    currency: 'VND',
    maximumFractionDigits: 0 
  }).format(price);
};

const PaymentInstructions = () => {
  return (
    <div className="space-y-4 mt-6">
      <h3 className="text-lg font-semibold">Hướng dẫn thanh toán</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* MoMo */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center">
              <div className="bg-pink-600 h-6 w-6 rounded-full flex items-center justify-center mr-2">
                <span className="text-white text-xs font-bold">M</span>
              </div>
              Thanh toán qua MoMo
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p><span className="font-medium">Số điện thoại:</span> 0987 654 321</p>
            <p><span className="font-medium">Tên:</span> Công ty DigitalMarket</p>
            <p><span className="font-medium">Nội dung chuyển khoản:</span> DH [Mã đơn hàng]</p>
            <div className="border border-dashed border-gray-300 p-3 mt-3 rounded">
              <p className="font-medium text-center mb-2">Quét mã QR</p>
              <div className="bg-gray-100 h-32 flex items-center justify-center">
                [Mã QR MoMo]
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* ZaloPay */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center">
              <div className="bg-blue-600 h-6 w-6 rounded-full flex items-center justify-center mr-2">
                <span className="text-white text-xs font-bold">Z</span>
              </div>
              Thanh toán qua ZaloPay
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p><span className="font-medium">Số điện thoại:</span> 0987 654 321</p>
            <p><span className="font-medium">Tên:</span> Công ty DigitalMarket</p>
            <p><span className="font-medium">Nội dung chuyển khoản:</span> DH [Mã đơn hàng]</p>
            <div className="border border-dashed border-gray-300 p-3 mt-3 rounded">
              <p className="font-medium text-center mb-2">Quét mã QR</p>
              <div className="bg-gray-100 h-32 flex items-center justify-center">
                [Mã QR ZaloPay]
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
        <p className="text-yellow-700">
          <span className="font-medium">Lưu ý:</span> Sau khi chuyển khoản thành công, vui lòng bấm nút 
          "Tôi đã thanh toán" bên dưới. Đơn hàng sẽ được xác nhận và xử lý trong 1-3 phút.
        </p>
      </div>
    </div>
  );
};

const Payment = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isConfirmingPayment, setIsConfirmingPayment] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'confirming' | 'completed'>('pending');

  // Fetch product details for the payment page
  const { data: product } = useQuery({
    queryKey: ['payment-product', orderId],
    queryFn: async () => {
      if (!orderId) return null;
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', orderId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!orderId
  });

  useEffect(() => {
    document.title = "Thanh toán đơn hàng | DigitalMarket";
  }, []);

  const handlePaymentConfirmation = async () => {
    setIsConfirmingPayment(true);
    setPaymentStatus('confirming');

    try {
      // Simulate payment confirmation process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update order status to paid
      if (orderId && user?.id) {
        const { error } = await supabase
          .from('orders')
          .update({ 
            status: 'paid',
            delivery_status: 'pending' 
          })
          .eq('product_id', orderId)
          .eq('user_id', user.id);
        
        if (error) throw error;
      }

      setPaymentStatus('completed');
      
      toast({
        title: "Thanh toán đã được xác nhận",
        description: "Đơn hàng của bạn đang được xử lý. Cảm ơn bạn đã mua hàng!",
      });
    } catch (error) {
      console.error('Payment confirmation error:', error);
      setPaymentStatus('pending');
      toast({
        title: "Lỗi xác nhận thanh toán",
        description: "Có lỗi xảy ra. Vui lòng thử lại hoặc liên hệ hỗ trợ.",
        variant: "destructive"
      });
    } finally {
      setIsConfirmingPayment(false);
    }
  };

  // Payment completed screen
  if (paymentStatus === 'completed') {
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
              <div className="space-y-3">
                <Button 
                  className="bg-marketplace-primary hover:bg-marketplace-primary/90" 
                  onClick={() => navigate(`/product/${orderId}`)}
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

  // Payment confirming screen
  if (paymentStatus === 'confirming') {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        
        <main className="flex-1 container py-12">
          <div className="max-w-3xl mx-auto">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-blue-600 animate-pulse" />
              </div>
              <h2 className="text-xl font-bold text-blue-800 mb-2">Đang xác nhận thanh toán...</h2>
              <p className="text-blue-700 mb-4">
                Vui lòng chờ trong giây lát. Chúng tôi đang xác nhận thanh toán của bạn.
              </p>
              <div className="animate-pulse text-blue-600">
                Thời gian xử lý: 1-3 phút
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
              onClick={() => navigate(`/product/${orderId}`)}
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
                      src={product?.image || '/placeholder.svg'} 
                      alt={product?.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{product?.title}</h3>
                    <p className="text-sm text-gray-500">
                      Người bán: {product?.seller_name}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span>Email người mua:</span>
                    <span className="font-medium">{user?.email}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Loại sản phẩm:</span>
                    <span className="font-medium">
                      {product?.product_type === 'file_download' ? 'File tải về' : 
                       product?.product_type === 'license_key_delivery' ? 'Mã kích hoạt' :
                       'Dịch vụ khác'}
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center text-lg font-bold py-2 border-t">
                  <span>Tổng thanh toán:</span>
                  <span className="text-marketplace-primary">{formatPrice(product?.price || 0)}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full bg-green-600 hover:bg-green-700" 
                onClick={handlePaymentConfirmation}
                disabled={isConfirmingPayment}
              >
                {isConfirmingPayment ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Đang xác nhận...
                  </>
                ) : "Tôi đã thanh toán"}
              </Button>
            </CardFooter>
          </Card>
          
          {/* Payment Instructions */}
          <PaymentInstructions />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Payment;
