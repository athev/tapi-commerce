
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ProductCard from "./ProductCard";
import { mockProducts } from "@/lib/supabase";

interface ProductGridProps {
  searchTerm?: string;
  category?: string;
}

const ProductGrid = ({ searchTerm = "", category = "all" }: ProductGridProps) => {
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
          // Fallback to mock data if database fails
          console.log('Falling back to mock data');
          return mockProducts;
        }
        
        console.log('Fetched products from database:', data);
        return data;
      } catch (error) {
        console.error('Error in product fetch:', error);
        // Fallback to mock data if request fails
        console.log('Falling back to mock data due to error');
        return mockProducts;
      }
    }
  });

  const filteredProducts = products?.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = category === "all" || product.category === category;
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 h-48 rounded-t-lg"></div>
            <div className="p-4">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    console.error('ProductGrid error:', error);
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredProducts?.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
      {filteredProducts?.length === 0 && (
        <div className="col-span-full text-center py-12">
          <h3 className="text-lg font-medium mb-2">Không tìm thấy sản phẩm</h3>
          <p className="text-gray-500">Thử thay đổi từ khóa tìm kiếm hoặc danh mục</p>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;
