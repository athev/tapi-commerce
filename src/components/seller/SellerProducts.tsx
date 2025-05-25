
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Edit, Trash, Download } from "lucide-react";

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
        .eq('seller_id', user?.id); // Ensure user can only delete their own products
      
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
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-marketplace-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Sản phẩm của tôi</h2>
        <div className="text-sm text-gray-500">
          Tổng cộng: {products?.length || 0} sản phẩm
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Tìm kiếm sản phẩm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full md:w-64">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Danh mục" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả danh mục</SelectItem>
              <SelectItem value="Ebook">Ebook</SelectItem>
              <SelectItem value="Khóa học">Khóa học</SelectItem>
              <SelectItem value="Phần mềm">Phần mềm</SelectItem>
              <SelectItem value="Template">Template</SelectItem>
              <SelectItem value="Âm nhạc">Âm nhạc</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {filteredProducts && filteredProducts.length > 0 ? (
        <div className="space-y-4">
          {filteredProducts.map((product) => (
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
                      <div>
                        <div className="text-lg font-semibold">
                          {product.title}
                          <Badge className="ml-2 bg-blue-500">
                            {product.category}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-500">
                          Tạo lúc: {new Date(product.created_at).toLocaleDateString('vi-VN')}
                        </div>
                      </div>
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
                        {product.file_url && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="border-blue-500 text-blue-600 hover:bg-blue-50"
                            onClick={() => window.open(product.file_url!, '_blank')}
                          >
                            <Download className="h-4 w-4 mr-1" /> File
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="border-green-500 text-green-600 hover:bg-green-50"
                        >
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
          <h3 className="text-lg font-medium mb-2">Chưa có sản phẩm nào</h3>
          <p className="text-gray-500">Hãy tạo sản phẩm đầu tiên của bạn!</p>
        </div>
      )}
    </div>
  );
};

export default SellerProducts;
