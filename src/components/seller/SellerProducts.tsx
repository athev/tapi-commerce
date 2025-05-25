
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import SellerProductsHeader from "./SellerProductsHeader";
import SellerProductsFilters from "./SellerProductsFilters";
import SellerProductItem from "./SellerProductItem";
import SellerProductsEmptyState from "./SellerProductsEmptyState";
import SellerProductsLoading from "./SellerProductsLoading";

const SellerProducts = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("all");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const { data: products, isLoading, refetch } = useQuery({
    queryKey: ['seller-products', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      console.log('Fetching products for seller:', user.id);
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching seller products:', error);
        throw error;
      }
      
      console.log('Fetched seller products:', data);
      return data;
    },
    enabled: !!user
  });

  const filteredProducts = products?.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = category === "all" || product.category === category;
    return matchesSearch && matchesCategory;
  });

  const handleDelete = async (productId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;
    
    setIsDeleting(productId);
    
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)
        .eq('seller_id', user?.id);
      
      if (error) throw error;
      
      toast.success('Sản phẩm đã được xóa');
      refetch();
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast.error('Có lỗi xảy ra khi xóa sản phẩm');
    } finally {
      setIsDeleting(null);
    }
  };

  if (isLoading) {
    return <SellerProductsLoading />;
  }

  return (
    <div>
      <SellerProductsHeader productCount={products?.length || 0} />
      
      <SellerProductsFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        category={category}
        onCategoryChange={setCategory}
      />
      
      {filteredProducts && filteredProducts.length > 0 ? (
        <div className="space-y-4">
          {filteredProducts.map((product) => (
            <SellerProductItem
              key={product.id}
              product={product}
              isDeleting={isDeleting === product.id}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <SellerProductsEmptyState />
      )}
    </div>
  );
};

export default SellerProducts;
