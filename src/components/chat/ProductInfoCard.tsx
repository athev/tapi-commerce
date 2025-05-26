
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Star } from "lucide-react";

interface Product {
  id: string;
  title: string;
  image?: string;
  seller_name?: string;
  product_type?: string;
}

interface ProductInfoCardProps {
  product: Product;
}

const ProductInfoCard = ({ product }: ProductInfoCardProps) => {
  const getProductTypeBadge = (type: string) => {
    const typeMap = {
      'file_download': { label: 'File tải về', variant: 'secondary' as const },
      'license_key_delivery': { label: 'Khóa bản quyền', variant: 'default' as const },
      'shared_account': { label: 'Tài khoản chung', variant: 'outline' as const },
      'upgrade_account_no_pass': { label: 'Nâng cấp tài khoản', variant: 'default' as const },
      'upgrade_account_with_pass': { label: 'Tài khoản premium', variant: 'default' as const },
    };
    return typeMap[type as keyof typeof typeMap] || { label: type, variant: 'secondary' as const };
  };

  const productTypeBadge = product.product_type ? getProductTypeBadge(product.product_type) : null;

  return (
    <Card className="border-l-4 border-l-green-500 mb-4">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
            {product.image ? (
              <img 
                src={product.image} 
                alt={product.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <ShoppingCart className="h-6 w-6 text-gray-500" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-medium text-sm leading-tight line-clamp-2">
                {product.title}
              </h3>
              {productTypeBadge && (
                <Badge variant={productTypeBadge.variant} className="text-xs whitespace-nowrap">
                  {productTypeBadge.label}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span>Người bán: {product.seller_name || 'Không rõ'}</span>
            </div>
            
            <div className="flex items-center gap-1 text-xs text-yellow-600 mt-1">
              <Star className="h-3 w-3 fill-current" />
              <span>Sản phẩm đang được tư vấn</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductInfoCard;
