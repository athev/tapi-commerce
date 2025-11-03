
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import EnhancedProductCard from "./EnhancedProductCard";
import { mockProducts, Product } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductGridProps {
  searchTerm?: string;
  category?: string;
  products?: Product[];
  isLoading?: boolean;
  error?: Error | null;
}

const ProductGrid = ({ 
  searchTerm = "", 
  category = "all", 
  products: externalProducts,
  isLoading: externalIsLoading,
  error: externalError 
}: ProductGridProps) => {
  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      console.log('Fetching products from database');
      
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching products:', error);
          console.log('Falling back to mock data');
          return mockProducts;
        }
        
        console.log('Fetched products from database:', data);
        return data;
      } catch (error) {
        console.error('Error in product fetch:', error);
        console.log('Falling back to mock data due to error');
        return mockProducts;
      }
    },
    enabled: !externalProducts,
  });

  // Use external data if provided, otherwise use internal query data
  const finalProducts = externalProducts || products;
  const finalIsLoading = externalIsLoading !== undefined ? externalIsLoading : isLoading;
  const finalError = externalError !== undefined ? externalError : error;

  const filteredProducts = finalProducts?.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = category === "all" || product.category === category;
    return matchesSearch && matchesCategory;
  });

  if (finalIsLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
            <Skeleton className="aspect-square w-full" />
            <div className="p-3 space-y-2">
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-8 w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (finalError) {
    console.error('ProductGrid error:', finalError);
  }

  if (!filteredProducts || filteredProducts.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="max-w-md mx-auto">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy sản phẩm</h3>
          <p className="text-gray-600 mb-6">
            Thử thay đổi từ khóa tìm kiếm hoặc chọn danh mục khác
          </p>
          {(searchTerm || category !== "all") && (
            <button 
              onClick={() => window.location.href = '/'}
              className="inline-flex items-center px-4 py-2 bg-marketplace-primary text-white rounded-lg hover:bg-marketplace-primary/90 transition-colors"
            >
              Xem tất cả sản phẩm
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-gray-600">
          Hiển thị {filteredProducts.length} sản phẩm
          {searchTerm && ` cho "${searchTerm}"`}
          {category !== "all" && ` trong danh mục "${category}"`}
        </p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
        {filteredProducts.map((product) => (
          <EnhancedProductCard 
            key={product.id} 
            id={product.id}
            title={product.title}
            price={{
              min: product.price,
              max: product.price
            }}
            image={product.image || '/placeholder.svg'}
            category={product.category}
            rating={4}
            reviews={product.purchases || 0}
            seller={{
              name: product.seller_name,
              verified: true
            }}
            inStock={product.in_stock || 999}
            isNew={new Date(product.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)}
            isHot={product.purchases && product.purchases > 50}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductGrid;
