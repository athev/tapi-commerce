
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash, Download } from "lucide-react";

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  image: string;
  created_at: string;
  purchases: number;
  in_stock: number;
  file_url?: string;
}

interface SellerProductItemProps {
  product: Product;
  isDeleting: boolean;
  onDelete: (productId: string) => void;
}

const SellerProductItem = ({ product, isDeleting, onDelete }: SellerProductItemProps) => {
  return (
    <Card className="overflow-hidden">
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
                  disabled={isDeleting}
                  onClick={() => onDelete(product.id)}
                >
                  <Trash className="h-4 w-4 mr-1" /> Xóa
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SellerProductItem;
