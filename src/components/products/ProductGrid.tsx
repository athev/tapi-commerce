
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

interface ProductGridProps {
  title: string;
  products: ProductCardProps[];
  showFilters?: boolean;
}

const ProductGrid = ({ title, products, showFilters = false }: ProductGridProps) => {
  const [sortBy, setSortBy] = useState("popular");
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{title}</h2>
        
        {showFilters && (
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
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>
      
      {products.length > 10 && (
        <div className="text-center mt-8">
          <Button variant="outline">
            Xem thêm
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;
