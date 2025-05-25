
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
  const { user, profile } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("all");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  console.log('SellerProducts: Auth state:', { 
    user: !!user, 
    profile: !!profile, 
    role: profile?.role 
  });

  const { data: products, isLoading, refetch } = useQuery({
    queryKey: ['seller-products', user?.id],
    queryFn: async () => {
      if (!user) {
        console.log('SellerProducts: No user found');
        return [];
      }
      
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

  // Block access if not logged in
  if (!user) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium mb-2">Bạn cần đăng nhập</h3>
        <p className="text-gray-500">
          Vui lòng đăng nhập để truy cập trang này.
        </p>
      </div>
    );
  }

  // Check if user is not a seller yet
  if (!profile || profile.role !== 'seller') {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium mb-2">Bạn chưa đăng ký gian hàng</h3>
        <p className="text-gray-500 mb-4">
          Bấm vào đây để tạo gian hàng đầu tiên
        </p>
        <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
          Đăng ký làm người bán
        </button>
      </div>
    );
  }

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
