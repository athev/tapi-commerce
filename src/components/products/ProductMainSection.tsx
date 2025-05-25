
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import ProductImageGallery from "./ProductImageGallery";
import ProductHeader from "./ProductHeader";
import ProductTypeOrderForm from "./ProductTypeOrderForm";
import ProductHighlights from "./ProductHighlights";
import ProductTabs from "./ProductTabs";
import SellerInfo from "./SellerInfo";
import { Product } from "@/lib/supabase";

interface ProductMainSectionProps {
  product: Product;
  isProcessing: boolean;
  hasPurchased: boolean;
  onPurchase: (buyerData?: any) => void;
}

const ProductMainSection = ({
  product,
  isProcessing,
  hasPurchased,
  onPurchase
}: ProductMainSectionProps) => {
  return (
    <div className="container py-4 lg:py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Left Column - Images & Details (Desktop: 7 cols, Mobile: full width) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Product Images */}
          <div className="lg:sticky lg:top-4">
            <ProductImageGallery 
              images={product?.image ? [product.image] : []} 
              title={product?.title || ''} 
            />
          </div>

          {/* Desktop Product Details - No sticky positioning */}
          <div className="hidden lg:block space-y-6">
            <ProductHighlights productType={product?.product_type || 'file_download'} />
            
            <Separator />
            
            <ProductTabs 
              description={product?.description || ''} 
              productType={product?.product_type || 'file_download'} 
            />
            
            <Separator />
            
            <SellerInfo 
              sellerId={product?.seller_id || ''} 
              sellerName={product?.seller_name || ''} 
            />
          </div>
        </div>
        
        {/* Right Column - Product Info & Purchase (Desktop: 5 cols) */}
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-4 space-y-6">
            {/* Product Header */}
            <ProductHeader 
              title={product?.title || ''} 
              price={product?.price || 0} 
              category={product?.category || ''} 
              productType={product?.product_type || 'file_download'} 
              purchases={product?.purchases || 0} 
              inStock={product?.in_stock || 0} 
              sellerName={product?.seller_name || ''} 
            />
            
            {/* Purchase Section */}
            <Card className="shadow-lg border-2 border-gray-100 bg-white">
              <CardContent className="p-4 lg:p-6">
                <ProductTypeOrderForm 
                  productType={product?.product_type || 'file_download'} 
                  onPurchase={onPurchase} 
                  isProcessing={isProcessing} 
                  hasPurchased={hasPurchased} 
                  product={product} 
                />
              </CardContent>
            </Card>

            {/* Trust Signals - Desktop */}
            <div className="hidden lg:block">
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-green-700">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span>Tải về ngay sau khi thanh toán</span>
                    </div>
                    <div className="flex items-center text-green-700">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span>Bảo mật thanh toán SSL 256-bit</span>
                    </div>
                    <div className="flex items-center text-green-700">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span>Hoàn tiền 100% nếu không hài lòng</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductMainSection;
