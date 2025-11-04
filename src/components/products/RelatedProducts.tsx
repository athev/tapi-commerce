import { useState, useEffect } from "react";
import EnhancedProductCard from "./EnhancedProductCard";
import { ProductCardProps } from "./ProductCard";
import { supabase } from "@/integrations/supabase/client";

interface RelatedProductsProps {
  currentProductId: string;
  category: string;
}

const RelatedProducts = ({ currentProductId, category }: RelatedProductsProps) => {
  const [relatedProducts, setRelatedProducts] = useState<ProductCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentProduct, setCurrentProduct] = useState<any>(null);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        setLoading(true);

        // First, get current product to know its price
        const { data: productData } = await supabase
          .from('products')
          .select('*')
          .eq('id', currentProductId)
          .single();

        if (!productData) return;
        
        setCurrentProduct(productData);

        const priceMin = Math.floor(productData.price * 0.7);
        const priceMax = Math.ceil(productData.price * 1.3);

        // Query 1: Same category + similar price range
        let { data: products } = await supabase
          .from('products')
          .select('*')
          .eq('category', category)
          .neq('id', currentProductId)
          .gte('price', priceMin)
          .lte('price', priceMax)
          .order('average_rating', { ascending: false })
          .limit(8);

        // Query 2: If not enough, get same category only
        if (!products || products.length < 4) {
          const { data: moreProducts } = await supabase
            .from('products')
            .select('*')
            .eq('category', category)
            .neq('id', currentProductId)
            .order('purchases', { ascending: false })
            .limit(8);

          products = [...(products || []), ...(moreProducts || [])];
        }

        // Query 3: If still not enough, get same seller
        if (products.length < 4) {
          const { data: sellerProducts } = await supabase
            .from('products')
            .select('*')
            .eq('seller_id', productData.seller_id)
            .neq('id', currentProductId)
            .limit(8);

          products = [...products, ...(sellerProducts || [])];
        }

        // Remove duplicates and transform to ProductCardProps
        const uniqueProducts = Array.from(
          new Map(products.map(p => [p.id, p])).values()
        ).slice(0, 4);

        const transformedProducts: ProductCardProps[] = uniqueProducts.map(p => ({
          id: p.id,
          title: p.title,
          price: { min: p.price, max: p.price },
          image: p.image || '/placeholder.svg',
          category: p.category,
          rating: Number(p.average_rating) || 5.0,
          reviews: p.review_count || 0,
          seller: { name: p.seller_name, verified: true },
          inStock: p.in_stock || 999,
          isNew: false,
          isHot: (p.purchases || 0) > 50
        }));

        setRelatedProducts(transformedProducts);
      } catch (error) {
        console.error('Error fetching related products:', error);
      } finally {
        setLoading(false);
      }
    };

    if (currentProductId && category) {
      fetchRelatedProducts();
    }
  }, [currentProductId, category]);

  if (loading) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          (Dựa trên: Cùng danh mục • Cùng mức giá • Đánh giá cao)
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="aspect-[3/4] bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (relatedProducts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Không có sản phẩm tương tự. Xem sản phẩm khác?</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        (Dựa trên: Cùng danh mục • Cùng mức giá • Đánh giá cao)
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        {relatedProducts.map((product) => (
          <EnhancedProductCard key={product.id} {...product} />
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;
