import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/utils/priceUtils";
import { Loader2, ShoppingCart } from "lucide-react";

interface Product {
  id: string;
  title: string;
  image: string | null;
  price: number;
  slug: string | null;
  in_stock: number | null;
}

interface ProductsBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  sellerId: string;
  shopName?: string;
  onSelectProduct: (product: Product) => void;
}

const ProductsBottomSheet = ({
  isOpen,
  onClose,
  sellerId,
  shopName,
  onSelectProduct,
}: ProductsBottomSheetProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && sellerId) {
      fetchProducts();
    }
  }, [isOpen, sellerId]);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('id, title, image, price, slug, in_stock')
      .eq('seller_id', sellerId)
      .eq('status', 'active')
      .order('quality_score', { ascending: false })
      .limit(20);

    if (!error && data) {
      setProducts(data);
    }
    setLoading(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[70vh] rounded-t-xl">
        <SheetHeader className="pb-4 border-b">
          <SheetTitle>Sản phẩm của {shopName || 'Shop'}</SheetTitle>
        </SheetHeader>
        
        <ScrollArea className="h-[calc(70vh-80px)] mt-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Shop chưa có sản phẩm nào
            </div>
          ) : (
            <div className="space-y-3 pr-4">
              {products.map((product) => (
                <div 
                  key={product.id}
                  className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <img
                    src={product.image || '/placeholder.svg'}
                    alt={product.title}
                    className="w-16 h-16 rounded-lg object-cover border"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-2">{product.title}</p>
                    <p className="text-destructive font-bold mt-1">
                      {formatPrice(product.price)}
                    </p>
                    {product.in_stock !== null && product.in_stock <= 0 && (
                      <span className="text-xs text-muted-foreground">Hết hàng</span>
                    )}
                  </div>
                  <Button
                    size="sm"
                    onClick={() => onSelectProduct(product)}
                    disabled={product.in_stock !== null && product.in_stock <= 0}
                    className="shrink-0"
                  >
                    <ShoppingCart className="h-4 w-4 mr-1" />
                    Mua
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default ProductsBottomSheet;
