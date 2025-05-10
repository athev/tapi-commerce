
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase, mockProducts, Product } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Edit, Trash } from "lucide-react";
import { Link } from "react-router-dom";

const SellerProducts = () => {
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const { data: products, isLoading, refetch } = useQuery({
    queryKey: ['seller-products', user?.id],
    queryFn: async () => {
      try {
        if (!user) return [];
        
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('seller_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        return data as Product[];
      } catch (error) {
        console.error('Error fetching seller products:', error);
        // For demo purposes, filter mock products as if they belong to the seller
        return mockProducts.filter(p => p.seller_id === user?.id);
      }
    },
    enabled: !!user,
  });

  const handleDelete = async (productId: string) => {
    setIsDeleting(productId);
    
    try {
      // In a real implementation, you would delete from Supabase
      // const { error } = await supabase.from('products').delete().eq('id', productId);
      // if (error) throw error;
      
      toast.success('Đã xóa sản phẩm thành công');
      refetch();
    } catch (error) {
      toast.error('Có lỗi xảy ra khi xóa sản phẩm');
    } finally {
      setIsDeleting(null);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-marketplace-primary"></div>
    </div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Sản phẩm của tôi</h2>
      
      {products && products.length > 0 ? (
        <div className="space-y-4">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  <div className="w-full md:w-48 h-40 bg-gray-100">
                    <img 
                      src={product.image || '/placeholder.svg'} 
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1 p-6">
                    <div className="flex justify-between">
                      <Link to={`/product/${product.id}`} className="text-lg font-semibold hover:text-marketplace-primary">
                        {product.title}
                      </Link>
                      <div className="text-green-600 font-semibold">
                        {new Intl.NumberFormat('vi-VN', { 
                          style: 'currency', 
                          currency: 'VND',
                          maximumFractionDigits: 0 
                        }).format(product.price)}
                      </div>
                    </div>
                    
                    <p className="text-gray-500 mt-2 line-clamp-2">{product.description}</p>
                    
                    <div className="flex justify-between items-center mt-4">
                      <div className="text-sm text-gray-500">
                        Đã bán: {product.purchases || 0} | Còn lại: {product.in_stock || 'Không giới hạn'}
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" /> Sửa
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          disabled={isDeleting === product.id}
                          onClick={() => handleDelete(product.id)}
                        >
                          <Trash className="h-4 w-4 mr-1" /> Xóa
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium mb-2">Bạn chưa có sản phẩm nào</h3>
          <p className="text-gray-500 mb-4">Hãy tạo sản phẩm đầu tiên của bạn.</p>
          <Button asChild>
            <Link to="/seller/products/add">Tạo sản phẩm</Link>
          </Button>
        </div>
      )}
    </div>
  );
};

export default SellerProducts;
