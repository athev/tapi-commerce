
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Check, ArrowLeft, Clock, Copy, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', { 
    style: 'currency', 
    currency: 'VND',
    maximumFractionDigits: 0 
  }).format(price);
};

const PaymentInstructions = ({ orderId }: { orderId: string }) => {
  const { toast } = useToast();

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Đã sao chép",
      description: `${label} đã được sao chép vào clipboard`,
    });
  };

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
            <div className="flex items-center justify-between">
              <span className="font-medium">Số điện thoại:</span>
              <div className="flex items-center gap-2">
                <span>0987 654 321</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => copyToClipboard("0987654321", "Số điện thoại MoMo")}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <p><span className="font-medium">Tên:</span> Công ty DigitalMarket</p>
            <div className="flex items-center justify-between">
              <span className="font-medium">Nội dung:</span>
              <div className="flex items-center gap-2">
                <code className="bg-gray-100 px-2 py-1 rounded text-xs">DH#{orderId}</code>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => copyToClipboard(`DH#${orderId}`, "Nội dung chuyển khoản")}
                >
                  <Copy className="h-3 w-3" />
                </Button>
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
            <div className="flex items-center justify-between">
              <span className="font-medium">Số điện thoại:</span>
              <div className="flex items-center gap-2">
                <span>0987 654 321</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => copyToClipboard("0987654321", "Số điện thoại ZaloPay")}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <p><span className="font-medium">Tên:</span> Công ty DigitalMarket</p>
            <div className="flex items-center justify-between">
              <span className="font-medium">Nội dung:</span>
              <div className="flex items-center gap-2">
                <code className="bg-gray-100 px-2 py-1 rounded text-xs">DH#{orderId}</code>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => copyToClipboard(`DH#${orderId}`, "Nội dung chuyển khoản")}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Banking Information */}
      <Card className="border-2 border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-base text-green-800">
            Chuyển khoản ngân hàng (Tự động xác nhận)
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">Ngân hàng:</span>
                <span>Vietcombank</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Số tài khoản:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono">1234567890</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => copyToClipboard("1234567890", "Số tài khoản")}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Tên tài khoản:</span>
                <span>DIGITALMARKET CO</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">Nội dung CK:</span>
                <div className="flex items-center gap-2">
                  <code className="bg-white px-2 py-1 rounded text-xs border">DH#{orderId}</code>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => copyToClipboard(`DH#${orderId}`, "Nội dung chuyển khoản")}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
        <p className="text-blue-700">
          <span className="font-medium">Thanh toán tự động:</span> Khi bạn chuyển khoản với đúng nội dung, 
          hệ thống sẽ tự động xác nhận thanh toán trong vòng 1-2 phút. Bạn không cần bấm nút "Tôi đã thanh toán".
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
    setPaymentStatus('confirming');

    try {
      // Simulate payment confirmation process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update order status to paid (fallback for manual confirmation)
      if (orderId && user?.id) {
        const { error } = await supabase
          .from('orders')
          .update({ 
            status: 'paid',
            delivery_status: 'pending' 
          })
          .eq('id', orderId)
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
              {(order as any)?.payment_verified_at && (
                <div className="text-sm text-green-600 mb-4">
                  Thanh toán được xác nhận lúc: {new Date((order as any).payment_verified_at).toLocaleString('vi-VN')}
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
            <CardFooter>
              <Button 
                variant="outline"
                className="w-full" 
                onClick={handleManualPaymentConfirmation}
                disabled={isConfirmingPayment}
              >
                {isConfirmingPayment ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600 mr-2"></div>
                    Đang xác nhận...
                  </>
                ) : "Tôi đã thanh toán (Xác nhận thủ công)"}
              </Button>
            </CardFooter>
          </Card>
          
          {/* Payment Instructions */}
          <PaymentInstructions orderId={orderId || ''} />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Payment;
