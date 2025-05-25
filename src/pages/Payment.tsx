
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { supabase, Order, Product } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
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

  useEffect(() => {
    document.title = "Thanh toán đơn hàng | DigitalMarket";
  }, []);

  // Redirect if not logged in
  useEffect(() => {
    if (!user && !localStorage.getItem('checking-auth')) {
      navigate('/login');
      return;
    }
  }, [user, navigate]);

  // Fetch order and product details
  const { data: orderDetails, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      if (!orderId) return null;

      try {
        console.log('Fetching order details for:', orderId);
        
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .single();
        
        if (orderError) {
          console.error('Order fetch error:', orderError);
          throw orderError;
        }

        console.log('Order data:', orderData);

        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('*')
          .eq('id', orderData.product_id)
          .single();
        
        if (productError) {
          console.error('Product fetch error:', productError);
          throw productError;
        }

        console.log('Product data:', productData);

        return {
          order: orderData as Order,
          product: productData as Product,
        };
      } catch (error) {
        console.error('Error fetching order details:', error);
        return null;
      }
    },
    enabled: !!orderId && !!user,
  });

  // Function to check payment status
  const checkPaymentStatus = async () => {
    setIsCheckingPayment(true);

    try {
      const { data, error } = await supabase
        .from('orders')
        .select('status')
        .eq('id', orderId)
        .single();
      
      if (error) throw error;

      if (data.status === 'paid') {
        toast({
          title: "Thanh toán thành công",
          description: "Đơn hàng của bạn đã được thanh toán",
        });
        
        // Redirect to product download page
        navigate(`/product/${orderDetails?.product.id}`);
      } else {
        toast({
          title: "Chờ xác nhận",
          description: "Đơn hàng của bạn đang được xử lý",
        });
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể kiểm tra trạng thái thanh toán",
        variant: "destructive",
      });
    } finally {
      setIsCheckingPayment(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 container py-12">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-marketplace-primary"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Ensure the order belongs to the logged-in user
  if (orderDetails && user && orderDetails.order.user_id !== user.id) {
    navigate('/');
    return null;
  }

  if (!orderDetails) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 container py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Không tìm thấy đơn hàng</h2>
            <p className="mt-2">Đơn hàng này không tồn tại hoặc đã bị xóa.</p>
            <Button onClick={() => navigate('/')} className="mt-4">
              Quay lại trang chủ
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const { order, product } = orderDetails;
  const isPaid = order.status === 'paid';

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 container py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center">Thanh toán đơn hàng</h1>
          
          {isPaid ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-green-800 mb-2">Đơn hàng đã được thanh toán!</h2>
              <p className="text-green-700 mb-6">Cảm ơn bạn đã mua sản phẩm của chúng tôi.</p>
              <Button className="bg-marketplace-primary" onClick={() => navigate(`/product/${product.id}`)}>
                Tải xuống sản phẩm
              </Button>
            </div>
          ) : (
            <>
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Chi tiết đơn hàng #{order.id.slice(0, 8).toUpperCase()}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 pb-4 border-b">
                      <div className="h-16 w-16 bg-gray-100 rounded overflow-hidden">
                        <img 
                          src={product.image || '/placeholder.svg'} 
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-medium">{product.title}</h3>
                        <p className="text-sm text-gray-500">
                          Người bán: {product.seller_name}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center text-lg font-bold py-2 border-t">
                      <span>Tổng thanh toán:</span>
                      <span className="text-marketplace-primary">{formatPrice(product.price)}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => navigate(`/product/${product.id}`)}>
                    Quay lại
                  </Button>
                  <Button onClick={checkPaymentStatus} disabled={isCheckingPayment}>
                    {isCheckingPayment ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Đang kiểm tra...
                      </>
                    ) : "Kiểm tra thanh toán"}
                  </Button>
                </CardFooter>
              </Card>
              
              <PaymentInstructions />
            </>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Payment;
