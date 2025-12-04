import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/utils/priceUtils";
import { Send, Loader2 } from "lucide-react";

interface Product {
  id: string;
  title: string;
  image: string | null;
  price: number;
}

interface SendProductSheetProps {
  isOpen: boolean;
  onClose: () => void;
  sellerId: string;
  onSendProduct: (product: Product, message?: string) => void;
}

const SendProductSheet = ({ isOpen, onClose, sellerId, onSendProduct }: SendProductSheetProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (isOpen && sellerId) {
      fetchProducts();
    }
  }, [isOpen, sellerId]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, title, image, price')
        .eq('seller_id', sellerId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!selectedProduct) return;
    
    setSending(true);
    try {
      await onSendProduct(selectedProduct, message.trim() || undefined);
      setSelectedProduct(null);
      setMessage("");
      onClose();
    } finally {
      setSending(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[80vh] rounded-t-2xl">
        <SheetHeader className="pb-4">
          <SheetTitle>Gửi sản phẩm cho khách</SheetTitle>
        </SheetHeader>

        {selectedProduct ? (
          <div className="flex flex-col h-[calc(100%-60px)]">
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg mb-4">
              <img 
                src={selectedProduct.image || '/placeholder.svg'} 
                alt={selectedProduct.title}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium line-clamp-2">{selectedProduct.title}</p>
                <p className="text-destructive font-bold">{formatPrice(selectedProduct.price)}</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSelectedProduct(null)}
              >
                Đổi
              </Button>
            </div>

            <div className="mb-4">
              <label className="text-sm font-medium mb-2 block">Lời nhắn (tuỳ chọn)</label>
              <Input
                placeholder="VD: Sản phẩm này phù hợp với bạn..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={100}
              />
            </div>

            <Button 
              onClick={handleSend} 
              disabled={sending}
              className="mt-auto"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Gửi sản phẩm
            </Button>
          </div>
        ) : (
          <ScrollArea className="h-[calc(100%-60px)]">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Chưa có sản phẩm nào
              </div>
            ) : (
              <div className="space-y-2">
                {products.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => setSelectedProduct(product)}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                  >
                    <img 
                      src={product.image || '/placeholder.svg'} 
                      alt={product.title}
                      className="w-14 h-14 rounded-lg object-cover border"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-2">{product.title}</p>
                      <p className="text-destructive font-bold text-sm">
                        {formatPrice(product.price)}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Chọn
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default SendProductSheet;
