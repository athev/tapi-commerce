
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { mockProducts } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Check } from "lucide-react";

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
          <span className="font-medium">Lưu ý:</span> Sau khi chuyển khoản thành công, vui lòng chờ trong giây lát. 
          Đơn hàng của bạn sẽ được xác nhận và xử lý bởi đội ngũ admin của chúng tôi.
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
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [isPaymentComplete, setIsPaymentComplete] = useState(false);

  // Mock order data for development
  const mockOrder = {
    id: orderId || 'order_123',
    user_id: user?.id || 'user1',
    product_id: '1',
    status: 'pending' as const,
    created_at: new Date().toISOString(),
  };

  const mockProduct = mockProducts[0]; // Use first mock product

  useEffect(() => {
    document.title = "Thanh toán đơn hàng | DigitalMarket";
  }, []);

  // Function to simulate payment completion
  const checkPaymentStatus = async () => {
    setIsCheckingPayment(true);

    // Simulate payment processing
    setTimeout(() => {
      setIsPaymentComplete(true);
      setIsCheckingPayment(false);
      
      toast({
        title: "Thanh toán thành công",
        description: "Đơn hàng của bạn đã được thanh toán",
      });
    }, 2000);
  };

  if (isPaymentComplete) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        
        <main className="flex-1 container py-12">
          <div className="max-w-3xl mx-auto">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-green-800 mb-2">Đơn hàng đã được thanh toán!</h2>
              <p className="text-green-700 mb-6">Cảm ơn bạn đã mua sản phẩm của chúng tôi.</p>
              <div className="space-y-3">
                <Button className="bg-marketplace-primary" onClick={() => navigate(`/product/${mockProduct.id}`)}>
                  Tải xuống sản phẩm
                </Button>
                <br />
                <Button variant="outline" onClick={() => navigate('/my-purchases')}>
                  Xem tất cả đơn hàng
                </Button>
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 container py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center">Thanh toán đơn hàng</h1>
          
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Chi tiết đơn hàng #{mockOrder.id.slice(0, 8).toUpperCase()}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4 pb-4 border-b">
                  <div className="h-16 w-16 bg-gray-100 rounded overflow-hidden">
                    <img 
                      src={mockProduct.image || '/placeholder.svg'} 
                      alt={mockProduct.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-medium">{mockProduct.title}</h3>
                    <p className="text-sm text-gray-500">
                      Người bán: {mockProduct.seller_name}
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-between items-center text-lg font-bold py-2 border-t">
                  <span>Tổng thanh toán:</span>
                  <span className="text-marketplace-primary">{formatPrice(mockProduct.price)}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => navigate(`/product/${mockProduct.id}`)}>
                Quay lại
              </Button>
              <Button onClick={checkPaymentStatus} disabled={isCheckingPayment}>
                {isCheckingPayment ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Đang xử lý thanh toán...
                  </>
                ) : "Xác nhận đã thanh toán"}
              </Button>
            </CardFooter>
          </Card>
          
          <PaymentInstructions />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Payment;
