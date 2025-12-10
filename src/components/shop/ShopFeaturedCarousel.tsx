import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

interface Product {
  id: string;
  title: string;
  price: number;
  image?: string;
  slug?: string;
  purchases?: number;
}

interface ShopFeaturedCarouselProps {
  products: Product[];
  title?: string;
}

const ShopFeaturedCarousel = ({ products, title = "Sản phẩm nổi bật" }: ShopFeaturedCarouselProps) => {
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(price);
  };

  if (products.length === 0) return null;

  // Get top 6 products by purchases
  const featuredProducts = [...products]
    .sort((a, b) => (b.purchases || 0) - (a.purchases || 0))
    .slice(0, 6);

  return (
    <div className="bg-card border-b">
      <div className="px-4 py-3">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-foreground">{title}</span>
          <button className="flex items-center text-xs text-primary">
            Xem tất cả <ChevronRight className="h-3 w-3" />
          </button>
        </div>

        {/* Products Carousel */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1">
          {featuredProducts.map((product) => (
            <Link
              key={product.id}
              to={`/product/${product.slug || product.id}`}
              className="flex-shrink-0 w-28"
            >
              <div className="aspect-square rounded-lg overflow-hidden bg-muted mb-1.5">
                <img
                  src={product.image || '/placeholder.svg'}
                  alt={product.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <p className="text-xs line-clamp-2 text-foreground mb-0.5">
                {product.title}
              </p>
              <p className="text-xs font-semibold text-primary">
                {formatPrice(product.price)}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShopFeaturedCarousel;
