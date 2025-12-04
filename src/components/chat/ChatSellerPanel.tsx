import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Store, ExternalLink, Package, Clock, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { formatPrice } from "@/utils/priceUtils";

interface SellerProfile {
  id: string;
  full_name: string;
  avatar?: string;
  shop_description?: string;
  is_online?: boolean;
  response_time?: string;
  total_products?: number;
  seller_rating?: number;
  slug?: string;
}

interface Product {
  id: string;
  title: string;
  image?: string;
  price?: number;
  slug?: string;
}

interface ChatSellerPanelProps {
  sellerId: string;
  currentProduct?: Product | null;
  chatType?: string;
  conversationCreatedAt?: string;
}

const ChatSellerPanel = ({ 
  sellerId, 
  currentProduct, 
  chatType = 'product_consultation',
  conversationCreatedAt
}: ChatSellerPanelProps) => {
  const navigate = useNavigate();
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [sellerProducts, setSellerProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSellerData = async () => {
      if (!sellerId) return;
      
      try {
        setLoading(true);
        
        // Fetch seller profile
        const { data: sellerData, error: sellerError } = await supabase
          .from('profiles')
          .select('id, full_name, avatar, shop_description, is_online, response_time, total_products, seller_rating, slug')
          .eq('id', sellerId)
          .single();
        
        if (sellerError) throw sellerError;
        setSeller(sellerData);

        // Fetch seller's products (excluding current product)
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('id, title, image, price, slug')
          .eq('seller_id', sellerId)
          .eq('status', 'active')
          .order('quality_score', { ascending: false })
          .limit(6);
        
        if (productsError) throw productsError;
        
        // Filter out current product
        const filteredProducts = currentProduct 
          ? productsData?.filter(p => p.id !== currentProduct.id) || []
          : productsData || [];
        
        setSellerProducts(filteredProducts.slice(0, 6));
      } catch (error) {
        console.error('Error fetching seller data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSellerData();
  }, [sellerId, currentProduct?.id]);

  const getChatTypeLabel = () => {
    switch (chatType) {
      case 'order_support':
        return 'Hỗ trợ đơn hàng';
      case 'service_request':
        return 'Yêu cầu dịch vụ';
      default:
        return 'Tư vấn sản phẩm';
    }
  };

  const handleViewShop = () => {
    if (seller?.slug) {
      navigate(`/shop/${seller.slug}`);
    } else {
      navigate(`/shop/id/${sellerId}`);
    }
  };

  const handleViewProduct = (product: Product) => {
    if (product.slug) {
      navigate(`/product/${product.slug}`);
    } else {
      navigate(`/product/id/${product.id}`);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground text-sm">Đang tải...</div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Không tìm thấy thông tin</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        {/* Seller Avatar & Info - Facebook style centered */}
        <div className="flex flex-col items-center text-center">
          <Avatar className="h-20 w-20 border-4 border-background shadow-lg">
            {seller.avatar ? (
              <AvatarImage src={seller.avatar} alt={seller.full_name} />
            ) : null}
            <AvatarFallback className="text-2xl bg-primary/10 text-primary">
              {seller.full_name?.charAt(0) || 'S'}
            </AvatarFallback>
          </Avatar>
          
          <h3 className="mt-3 font-semibold text-base">{seller.full_name}</h3>
          
          <div className="flex items-center gap-2 mt-1">
            {seller.is_online ? (
              <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                <span className="w-2 h-2 rounded-full bg-green-500 mr-1 animate-pulse" />
                Đang hoạt động
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-xs">
                Ngoại tuyến
              </Badge>
            )}
          </div>

          {seller.shop_description && (
            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
              {seller.shop_description}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button 
            variant="outline" 
            className="w-full justify-start gap-2"
            onClick={handleViewShop}
          >
            <Store className="h-4 w-4" />
            Xem cửa hàng
          </Button>
          
          {currentProduct && (
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2"
              onClick={() => handleViewProduct(currentProduct)}
            >
              <Package className="h-4 w-4" />
              Xem sản phẩm
            </Button>
          )}
        </div>

        <Separator />

        {/* Chat Info */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Thông tin cuộc trò chuyện</h4>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
              <span>{getChatTypeLabel()}</span>
            </div>
            
            {conversationCreatedAt && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>
                  Bắt đầu {formatDistanceToNow(new Date(conversationCreatedAt), { 
                    addSuffix: true, 
                    locale: vi 
                  })}
                </span>
              </div>
            )}

            {seller.response_time && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <span>Phản hồi: {seller.response_time}</span>
              </div>
            )}
          </div>
        </div>

        {/* Current Product */}
        {currentProduct && (
          <>
            <Separator />
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">Sản phẩm đang trao đổi</h4>
              
              <div 
                className="flex gap-3 p-2 rounded-lg border bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleViewProduct(currentProduct)}
              >
                <div className="w-16 h-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                  {currentProduct.image ? (
                    <img 
                      src={currentProduct.image} 
                      alt={currentProduct.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                <p className="text-sm font-medium line-clamp-2">{currentProduct.title}</p>
                {currentProduct.price && (
                  <p className="text-sm text-primary font-semibold mt-1">
                    {formatPrice(currentProduct.price)}
                  </p>
                )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Other Products from Shop */}
        {sellerProducts.length > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-muted-foreground">Sản phẩm khác của shop</h4>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs h-auto py-1"
                  onClick={handleViewShop}
                >
                  Xem tất cả
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                {sellerProducts.map((product) => (
                  <div 
                    key={product.id}
                    className="cursor-pointer group"
                    onClick={() => handleViewProduct(product)}
                  >
                    <div className="aspect-square rounded-md overflow-hidden bg-muted">
                      {product.image ? (
                        <img 
                          src={product.image} 
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs mt-1 line-clamp-1 group-hover:text-primary transition-colors">
                      {product.title}
                    </p>
                    <p className="text-xs text-primary font-medium">
                      {formatPrice(product.price)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Seller Stats */}
        <Separator />
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-lg font-semibold">{seller.total_products || 0}</p>
            <p className="text-xs text-muted-foreground">Sản phẩm</p>
          </div>
          <div>
            <p className="text-lg font-semibold">{seller.seller_rating?.toFixed(1) || '5.0'}</p>
            <p className="text-xs text-muted-foreground">Đánh giá</p>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
};

export default ChatSellerPanel;
