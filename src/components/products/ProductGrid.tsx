
import { useState } from "react";
import ProductCard, { ProductCardProps } from "./ProductCard";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Product } from "@/lib/supabase";

interface ProductGridProps {
  products: Product[];
  isLoading: boolean;
  error: any;
}

// Helper function to transform Product to ProductCardProps
const transformProductToCard = (product: Product): ProductCardProps => {
  return {
    id: product.id,
    title: product.title,
    price: {
      min: product.price,
      max: product.price
    },
    image: product.image || '/placeholder.svg',
    category: product.category,
    rating: 4.5, // Default rating
    reviews: product.purchases || 0,
    seller: {
      name: product.seller_name,
      verified: true // Default to verified
    },
    inStock: product.in_stock || 0,
    isNew: false, // Could be calculated based on created_at
    isHot: product.purchases > 50, // Hot if more than 50 purchases
  };
};

const ProductGrid = ({ products, isLoading, error }: ProductGridProps) => {
  const [sortBy, setSortBy] = useState("popular");
  
  if (isLoading) {
    return (
      <section className="container py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {Array.from({ length: 10 }).map((_, index) => (
            <div key={index} className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="container py-12">
        <div className="text-center">
          <p className="text-gray-500">Có lỗi xảy ra khi tải sản phẩm</p>
        </div>
      </section>
    );
  }

  const transformedProducts = products.map(transformProductToCard);
  
  return (
    <section className="container py-12">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Sản phẩm nổi bật</h2>
          
          <div className="flex items-center gap-4">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sắp xếp theo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Phổ biến</SelectItem>
                <SelectItem value="newest">Mới nhất</SelectItem>
                <SelectItem value="price-asc">Giá tăng dần</SelectItem>
                <SelectItem value="price-desc">Giá giảm dần</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {transformedProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
        
        {transformedProducts.length > 10 && (
          <div className="text-center mt-8">
            <Button variant="outline">
              Xem thêm
            </Button>
          </div>
        )}

        {transformedProducts.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">Không có sản phẩm nào để hiển thị</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductGrid;
