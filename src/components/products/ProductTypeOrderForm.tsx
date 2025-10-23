import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Mail, User, Key, Users, Info, Download, FileText, Zap, Heart } from "lucide-react";
import PurchaseConfirmationModal from "./PurchaseConfirmationModal";
import ProductVariants, { ProductVariant } from "./ProductVariants";
import ProductTrustBadges from "./ProductTrustBadges";
import { useNavigate } from "react-router-dom";
import { upgradeAccountNoPassSchema, upgradeAccountWithPassSchema } from "@/lib/validationSchemas";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/utils/orderUtils";

interface ProductTypeOrderFormProps {
  productType: string;
  onPurchase: (buyerData?: any) => Promise<any>;
  isProcessing: boolean;
  hasPurchased: boolean;
  product: any;
}

const ProductTypeOrderForm = ({ 
  productType, 
  onPurchase, 
  isProcessing, 
  hasPurchased,
  product 
}: ProductTypeOrderFormProps) => {
  const navigate = useNavigate();
  const [buyerData, setBuyerData] = useState({
    email: '',
    username: '',
    password: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [currentPrice, setCurrentPrice] = useState(product?.price || 0);
  const [originalPrice, setOriginalPrice] = useState<number | null>(null);
  const [discountPercentage, setDiscountPercentage] = useState<number | null>(null);

  // Fetch product variants
  useEffect(() => {
    const fetchVariants = async () => {
      if (!product?.id) return;
      
      const { data, error } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', product.id)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      
      if (!error && data) {
        setVariants(data);
        // Auto-select first variant if available
        if (data.length > 0) {
          setSelectedVariantId(data[0].id);
          setCurrentPrice(data[0].price);
          setOriginalPrice(data[0].original_price || null);
          setDiscountPercentage(data[0].discount_percentage || null);
        }
      }
    };
    
    fetchVariants();
  }, [product?.id]);

  const handleVariantSelect = (variantId: string) => {
    setSelectedVariantId(variantId);
    const variant = variants.find(v => v.id === variantId);
    if (variant) {
      setCurrentPrice(variant.price);
      setOriginalPrice(variant.original_price || null);
      setDiscountPercentage(variant.discount_percentage || null);
    }
  };

  const validateInputs = () => {
    const newErrors: Record<string, string> = {};

    try {
      if (productType === 'upgrade_account_no_pass') {
        upgradeAccountNoPassSchema.parse(buyerData);
      } else if (productType === 'upgrade_account_with_pass') {
        upgradeAccountWithPassSchema.parse(buyerData);
      }
      return true;
    } catch (error: any) {
      if (error.errors) {
        error.errors.forEach((err: any) => {
          const field = err.path[0];
          newErrors[field] = err.message;
        });
      }
      setErrors(newErrors);
      return false;
    }
  };

  const handlePurchaseClick = () => {
    if (['upgrade_account_no_pass', 'upgrade_account_with_pass'].includes(productType)) {
      if (!validateInputs()) {
        return;
      }
    }
    setShowConfirmModal(true);
  };

  const handleConfirmPurchase = async () => {
    setShowConfirmModal(false);
    
    try {
      const newOrder = await onPurchase(buyerData);
      
      if (newOrder && newOrder.id) {
        navigate(`/payment/${newOrder.id}`);
      } else {
        throw new Error('Không thể tạo đơn hàng. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Order creation failed');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setBuyerData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Get product type info
  const getProductTypeInfo = (type: string) => {
    const typeInfo = {
      file_download: {
        icon: Download,
        label: 'Tải tệp/File tải'
      },
      shared_account: {
        icon: Users,
        label: 'Tài khoản dùng chung'
      },
      upgrade_account_no_pass: {
        icon: User,
        label: 'Nâng cấp không cần mật khẩu'
      },
      upgrade_account_with_pass: {
        icon: FileText,
        label: 'Nâng cấp có mật khẩu'
      },
      license_key_delivery: {
        icon: Key,
        label: 'Mã kích hoạt'
      }
    };
    
    return typeInfo[type as keyof typeof typeInfo] || typeInfo.file_download;
  };

  const productTypeInfo = getProductTypeInfo(productType);
  const TypeIcon = productTypeInfo.icon;

  // After purchase UI - only show for file_download type
  if (hasPurchased && productType === 'file_download') {
    return (
      <div className="space-y-4">
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3 mb-3">
              <Download className="h-5 w-5 text-green-600" />
              <h3 className="font-medium text-green-900">Sản phẩm đã mua</h3>
            </div>
            <p className="text-sm text-green-800 mb-3">
              Bạn có thể tải xuống file ngay bây giờ.
            </p>
          </CardContent>
        </Card>
        
        <Button 
          className="w-full bg-green-600 hover:bg-green-700"
          onClick={() => {
            if (product?.file_url) {
              window.open(product.file_url, '_blank');
            } else {
              const link = document.createElement('a');
              link.href = 'data:text/plain;charset=utf-8,Sample Digital Product Content';
              link.download = `${product?.title || 'product'}.txt`;
              link.click();
            }
          }}
        >
          <Download className="h-5 w-5 mr-2" /> Tải xuống file
        </Button>
      </div>
    );
  }

  // Before purchase UI (for all product types, or after purchase for non-file-download types)
  return (
    <>
      <div className="space-y-4">
        {/* Price Display with Discount */}
        <Card className="border-2">
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Product Type Badge */}
              <div className="flex items-center gap-2">
                <TypeIcon className="h-5 w-5 text-primary" />
                <Badge variant="secondary" className="text-sm">
                  {productTypeInfo.label}
                </Badge>
              </div>

              {/* Price Section */}
              <div className="space-y-2">
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold text-destructive">
                    {formatPrice(currentPrice)}
                  </span>
                  {originalPrice && originalPrice > currentPrice && (
                    <>
                      <span className="text-xl text-muted-foreground line-through">
                        {formatPrice(originalPrice)}
                      </span>
                      {discountPercentage && (
                        <Badge variant="destructive" className="text-base px-2 py-1">
                          -{discountPercentage}%
                        </Badge>
                      )}
                    </>
                  )}
                </div>
                
                {product?.in_stock && product.in_stock > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Còn lại: <span className="font-semibold text-foreground">{product.in_stock}</span> sản phẩm
                  </p>
                )}
              </div>

              {/* Voucher/Promo Badges */}
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Freeship 30K
                </Badge>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  Giao hàng tự động
                </Badge>
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                  Hoàn tiền 100%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Product Variants Selector */}
        {variants.length > 0 && (
          <ProductVariants 
            variants={variants}
            selectedVariantId={selectedVariantId}
            onVariantSelect={handleVariantSelect}
            basePrice={product?.price || 0}
          />
        )}

        {/* Show success message for non-file-download products after purchase */}
        {hasPurchased && productType !== 'file_download' && (
          <Card className="bg-blue-50 border-blue-200 mb-4">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Info className="h-5 w-5 text-blue-600" />
                <div>
                  <h3 className="font-medium text-blue-900">Đơn hàng đã được tạo</h3>
                  <p className="text-sm text-blue-800">
                    Đơn hàng của bạn đã được tạo thành công. Bạn có thể mua thêm nếu cần.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Input fields for upgrade account types */}
        {productType === 'upgrade_account_no_pass' && (
          <div className="space-y-2">
            <Label htmlFor="buyer-email">Email cần nâng cấp *</Label>
            <Input
              id="buyer-email"
              type="email"
              value={buyerData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={errors.email ? "border-red-500" : ""}
              placeholder="Nhập email cần nâng cấp"
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>
        )}

        {productType === 'upgrade_account_with_pass' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="buyer-email">Email *</Label>
              <Input
                id="buyer-email"
                type="email"
                value={buyerData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={errors.email ? "border-red-500" : ""}
                placeholder="Nhập email"
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="buyer-username">Tên đăng nhập *</Label>
              <Input
                id="buyer-username"
                value={buyerData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                className={errors.username ? "border-red-500" : ""}
                placeholder="Nhập tên đăng nhập"
              />
              {errors.username && (
                <p className="text-sm text-red-500">{errors.username}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="buyer-password">Mật khẩu *</Label>
              <Input
                id="buyer-password"
                type="password"
                value={buyerData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={errors.password ? "border-red-500" : ""}
                placeholder="Nhập mật khẩu"
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
            </div>
          </div>
        )}

        {/* Dual CTA Buttons */}
        <div className="space-y-3">
          <Button 
            className="w-full h-14 text-lg font-semibold bg-destructive hover:bg-destructive/90 shadow-lg"
            size="lg"
            onClick={handlePurchaseClick}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Đang xử lý...
              </>
            ) : (
              <>
                <Zap className="h-5 w-5 mr-2" /> MUA NGAY - {formatPrice(currentPrice)}
              </>
            )}
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full h-12 text-base font-medium border-2"
            size="lg"
            onClick={handlePurchaseClick}
            disabled={isProcessing}
          >
            <ShoppingCart className="h-5 w-5 mr-2" /> Thêm vào giỏ hàng
          </Button>
        </div>

        {/* Trust Badges */}
        <ProductTrustBadges />

        {/* Urgency Message */}
        <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-3 text-center">
          <p className="text-sm font-semibold text-orange-800">
            🔥 Ưu đãi đặc biệt - Số lượng có hạn!
          </p>
        </div>
      </div>

      {/* Confirmation Modal */}
      <PurchaseConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmPurchase}
        isProcessing={isProcessing}
        product={product}
        buyerData={buyerData}
      />
    </>
  );
};

export default ProductTypeOrderForm;
