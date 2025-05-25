
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Product } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ProductBreadcrumb from "@/components/products/ProductBreadcrumb";
import ProductMainSection from "@/components/products/ProductMainSection";
import ProductMobileAccordion from "@/components/products/ProductMobileAccordion";
import ProductReviewsSection from "@/components/products/ProductReviewsSection";
import ProductRelatedSection from "@/components/products/ProductRelatedSection";
import StickyBottomButton from "@/components/products/StickyBottomButton";

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
    retry: false
  });

  const { data: existingOrder } = useQuery({
    queryKey: ['user-order', id, user?.id],
    queryFn: async () => {
      if (!user?.id || !id || !product) return null;

      if (product.product_type !== 'file_download') {
        return null;
      }
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
    enabled: !!user?.id && !!id && !!product
  });

  useEffect(() => {
    if (existingOrder && product?.product_type === 'file_download') {
      setHasPurchased(true);
    } else {
      setHasPurchased(false);
    }
  }, [existingOrder, product?.product_type]);

  const handlePurchase = async (buyerData?: any) => {
    if (!user) {
      toast({
        title: "Vui lòng đăng nhập",
        description: "Bạn cần đăng nhập để mua sản phẩm này",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }

    if (!product) return;

    setIsProcessing(true);
    try {
      const { data: order, error } = await supabase
        .from('orders')
        .insert([{
          user_id: user.id,
          product_id: product.id,
          status: 'paid',
          buyer_email: buyerData?.email || user.email || '',
          buyer_data: buyerData || null,
          delivery_status: 'pending'
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating order:', error);
        throw error;
      }

      if (product.product_type === 'file_download') {
        setHasPurchased(true);
      }

      toast({
        title: "Đặt hàng thành công!",
        description: "Cảm ơn bạn đã mua sản phẩm. Thông tin sẽ được xử lý ngay."
      });
    } catch (error) {
      console.error('Purchase error:', error);
      toast({
        title: "Lỗi thanh toán",
        description: "Có lỗi xảy ra khi xử lý đơn hàng. Vui lòng thử lại.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-marketplace-primary"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <Card className="max-w-md">
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
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      
      <main className="flex-1 pb-20 lg:pb-0">
        {/* Breadcrumb */}
        <ProductBreadcrumb 
          category={product?.category} 
          title={product?.title} 
        />

        {/* Main Product Section */}
        <ProductMainSection
          product={product!}
          isProcessing={isProcessing}
          hasPurchased={hasPurchased}
          onPurchase={handlePurchase}
        />

        {/* Mobile Accordion */}
        <ProductMobileAccordion
          productType={product?.product_type || 'file_download'}
          description={product?.description || ''}
          sellerName={product?.seller_name || ''}
        />

        {/* Reviews Section */}
        <ProductReviewsSection />

        {/* Related Products */}
        <ProductRelatedSection
          currentProductId={id || ''}
          category={product?.category || ''}
        />
      </main>

      {/* Sticky Bottom Button for Mobile */}
      <StickyBottomButton
        onPurchase={() => handlePurchase()}
        isProcessing={isProcessing}
        hasPurchased={hasPurchased}
        productType={product?.product_type || 'file_download'}
        price={product?.price || 0}
      />
      
      <Footer />
    </div>
  );
};

export default ProductDetail;
