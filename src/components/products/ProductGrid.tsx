import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import EnhancedProductCard from "./EnhancedProductCard";
import { mockProducts, Product } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";
import { matchesSearchTerm, calculateRelevanceScore } from "@/lib/searchUtils";
import { SortOption } from "./ProductToolbar";

interface ProductGridProps {
  searchTerm?: string;
  category?: string;
  sortBy?: SortOption;
  products?: Product[];
  isLoading?: boolean;
  error?: Error | null;
}

const ProductGrid = ({ 
  searchTerm = "", 
  category = "all",
  sortBy = "newest",
  products: externalProducts,
  isLoading: externalIsLoading,
  error: externalError 
}: ProductGridProps) => {
  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products', searchTerm, category],
    queryFn: async () => {
      console.log('Fetching products from database with filters:', { searchTerm, category });
      
      try {
        let query = supabase
          .from('products')
          .select('*')
          .eq('status', 'active');
        
        // Filter by category on server-side
        if (category && category !== 'all') {
          query = query.eq('category', category);
        }
        
        // Full-text search if searchTerm exists
        if (searchTerm && searchTerm.trim()) {
          const searchPattern = `%${searchTerm.trim()}%`;
          query = query.or(
            `title.ilike.${searchPattern},description.ilike.${searchPattern},seller_name.ilike.${searchPattern},meta_title.ilike.${searchPattern}`
          );
        }
        
        const { data, error } = await query;
        
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
    staleTime: 60 * 1000, // Cache for 1 minute
    enabled: !externalProducts,
  });

  // Use external data if provided, otherwise use internal query data
  const finalProducts = externalProducts || products;
  const finalIsLoading = externalIsLoading !== undefined ? externalIsLoading : isLoading;
  const finalError = externalError !== undefined ? externalError : error;

  // Client-side filtering with Vietnamese normalization (fallback for keywords)
  const filteredProducts = finalProducts?.filter(product => {
    const matchesSearch = matchesSearchTerm(product, searchTerm);
    const matchesCategory = category === "all" || product.category === category;
    return matchesSearch && matchesCategory;
  });

  // Client-side sorting
  let sortedProducts = filteredProducts || [];

  if (searchTerm && sortBy === 'relevance') {
    // Sort by relevance score when searching
    sortedProducts = [...sortedProducts].sort((a, b) => {
      const scoreA = calculateRelevanceScore(a, searchTerm);
      const scoreB = calculateRelevanceScore(b, searchTerm);
      
      // Debug logging for top products
      console.log(`[Relevance] "${a.title.trim()}" = ${scoreA} | "${b.title.trim()}" = ${scoreB}`);
      
      return scoreB - scoreA; // Descending
    });
  } else {
    // Apply other sorting methods
    sortedProducts = [...sortedProducts].sort((a, b) => {
      switch (sortBy) {
        case 'recommended':
          // Primary: Sort by quality score
          const scoreDiff = (b.quality_score || 0) - (a.quality_score || 0);
          
          // Tiebreaker: If scores are very close (< 0.5 difference), use created_at (newest first)
          if (Math.abs(scoreDiff) < 0.5) {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          }
          
          return scoreDiff;
        
        case 'trending':
          // Sort by 7-day purchases
          return (b.purchases_last_7_days || 0) - (a.purchases_last_7_days || 0);
        
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        
        case 'price_asc':
          return a.price - b.price;
        
        case 'price_desc':
          return b.price - a.price;
        
        case 'popular':
          return (b.purchases || 0) - (a.purchases || 0);
        
        case 'rating':
          return (b.average_rating || 0) - (a.average_rating || 0);
        
        default:
          return 0;
      }
    });
  }

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

  if (!sortedProducts || sortedProducts.length === 0) {
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
      <div className="flex justify-between items-center mb-4 md:mb-6">
        <p className="text-xs md:text-sm text-muted-foreground">
          Hiển thị {filteredProducts.length} sản phẩm
          {searchTerm && ` cho "${searchTerm}"`}
          {category !== "all" && ` trong danh mục "${category}"`}
        </p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-3 lg:gap-4">
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
