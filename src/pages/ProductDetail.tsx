
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

  // Check if user has already purchased this product
  const { data: existingOrder } = useQuery({
    queryKey: ['user-order', id, user?.id],
    queryFn: async () => {
      if (!user?.id || !id) return null;
      
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
    enabled: !!user?.id && !!id,
  });

  useEffect(() => {
    if (existingOrder) {
      setHasPurchased(true);
    }
  }, [existingOrder]);

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
      setHasPurchased(true);

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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-marketplace-primary"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Card>
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
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <div className="space-y-4">
            <img 
              src={product.image || "/placeholder.svg"} 
              alt={product.title}
              className="w-full aspect-square object-cover rounded-lg"
            />
          </div>
          
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
              <p className="text-2xl font-bold text-marketplace-primary mb-4">
                {formatPrice(product.price)}
              </p>
              
              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                <span>Người bán: {product.seller_name}</span>
                <span>•</span>
                <span>Đã bán: {product.purchases}</span>
                <span>•</span>
                <span>Còn lại: {product.in_stock}</span>
              </div>
              
              {product.product_type && (
                <Badge variant="outline" className="mb-4">
                  {getProductTypeLabel(product.product_type)}
                </Badge>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Mô tả sản phẩm</h3>
              <p className="text-gray-700 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Enhanced Product Type Order Form */}
            <ProductTypeOrderForm 
              productType={product.product_type || 'file_download'}
              onPurchase={handlePurchase}
              isProcessing={isProcessing}
              hasPurchased={hasPurchased}
              product={product}
            />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ProductDetail;
