
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
    <Card className="border-l-4 border-l-green-500 mb-2">
      <CardContent className="p-3">
        <div className="flex items-start gap-2">
          <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center overflow-hidden flex-shrink-0">
            {product.image ? (
              <img 
                src={product.image} 
                alt={product.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <ShoppingCart className="h-4 w-4 text-gray-500" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-1 mb-1">
              <h3 className="font-medium text-xs leading-tight line-clamp-2">
                {product.title}
              </h3>
              {productTypeBadge && (
                <Badge variant={productTypeBadge.variant} className="text-xs px-1 py-0 whitespace-nowrap">
                  {productTypeBadge.label}
                </Badge>
              )}
            </div>
            
            <p className="text-xs text-gray-600 truncate">
              {product.seller_name || 'Không rõ'}
            </p>
            
            <div className="flex items-center gap-1 text-xs text-yellow-600 mt-1">
              <Star className="h-3 w-3 fill-current" />
              <span>Đang tư vấn</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductInfoCard;
