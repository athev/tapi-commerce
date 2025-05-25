import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Product } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', { 
    style: 'currency', 
    currency: 'VND',
    maximumFractionDigits: 0 
  }).format(price);
};

const getProductTypeLabel = (type: string) => {
  const types = {
    file_download: 'Tải xuống file',
    license_key_delivery: 'Gửi License Key',
    shared_account: 'Tài khoản dùng chung',
    upgrade_account_no_pass: 'Nâng cấp tài khoản',
    upgrade_account_with_pass: 'Nâng cấp tài khoản (có pass)'
  };
  return types[type as keyof typeof types] || type;
};

const ProductDetail = () => {
  const { id } = useParams();
  const { user, isOnline } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [buyerData, setBuyerData] = useState<Record<string, any>>({});
  const [isProcessing, setIsProcessing] = useState(false);

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

  const handlePurchase = async () => {
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

    // Validate required buyer data based on product type
    const isValid = validateBuyerData(product.product_type, buyerData);
    if (!isValid) {
      toast({
        title: "Thông tin không đầy đủ",
        description: "Vui lòng điền đầy đủ thông tin bắt buộc",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      console.log('Creating order with data:', {
        user_id: user.id,
        product_id: product.id,
        buyer_email: buyerData.email || user.email,
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
            status: 'paid', // Simulate successful payment
            buyer_email: buyerData.email || user.email || '',
            buyer_data: Object.keys(buyerData).length > 0 ? buyerData : null,
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

      toast({
        title: "Đơn hàng thành công!",
        description: "Cảm ơn bạn đã mua sản phẩm. Thông tin sẽ được gửi qua email.",
      });

      // Navigate to purchase success or show purchase details
      navigate('/my-purchases');
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

  const validateBuyerData = (productType: string | undefined, data: Record<string, any>): boolean => {
    if (!productType) return true;

    switch (productType) {
      case 'upgrade_account_no_pass':
        return !!data.email;
      case 'upgrade_account_with_pass':
        return !!data.email && !!data.username && !!data.password;
      default:
        return true;
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

            {/* Product Type Specific Order Form */}
            <ProductTypeOrderForm 
              productType={product.product_type}
              buyerData={buyerData}
              onBuyerDataChange={setBuyerData}
            />

            <Button 
              onClick={handlePurchase} 
              className="w-full bg-marketplace-primary hover:bg-marketplace-primary/90"
              size="lg"
              disabled={isProcessing}
            >
              {isProcessing ? "Đang xử lý..." : "Mua ngay"}
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

type ProductTypeOrderFormProps = {
  productType?: string;
  buyerData: Record<string, any>;
  onBuyerDataChange: (data: Record<string, any>) => void;
};

const ProductTypeOrderForm: React.FC<ProductTypeOrderFormProps> = ({ productType, buyerData, onBuyerDataChange }) => {
  const handleChange = (key: string, value: any) => {
    onBuyerDataChange({ ...buyerData, [key]: value });
  };

  switch (productType) {
    case 'upgrade_account_no_pass':
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email tài khoản</Label>
            <Input
              type="email"
              id="email"
              placeholder="Nhập email của bạn"
              value={buyerData.email || ''}
              onChange={(e) => handleChange('email', e.target.value)}
            />
          </div>
        </div>
      );
    case 'upgrade_account_with_pass':
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email tài khoản</Label>
            <Input
              type="email"
              id="email"
              placeholder="Nhập email của bạn"
              value={buyerData.email || ''}
              onChange={(e) => handleChange('email', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Tên đăng nhập</Label>
            <Input
              type="text"
              id="username"
              placeholder="Nhập tên đăng nhập"
              value={buyerData.username || ''}
              onChange={(e) => handleChange('username', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Mật khẩu</Label>
            <Input
              type="password"
              id="password"
              placeholder="Nhập mật khẩu"
              value={buyerData.password || ''}
              onChange={(e) => handleChange('password', e.target.value)}
            />
          </div>
        </div>
      );
    default:
      return null;
  }
};

export default ProductDetail;
