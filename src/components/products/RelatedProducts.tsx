
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import EnhancedProductCard from "./EnhancedProductCard";
import { ProductCardProps } from "./ProductCard";

interface RelatedProductsProps {
  currentProductId: string;
  category: string;
}

const RelatedProducts = ({ currentProductId, category }: RelatedProductsProps) => {
  // Mock data for related products
  const relatedProducts: ProductCardProps[] = [
    {
      id: "related-1",
      title: "Excel Template Bundle - 100+ Professional Templates",
      price: { min: 299000, max: 299000 },
      image: "/placeholder.svg",
      category: "Templates",
      rating: 4.8,
      reviews: 156,
      seller: { name: "Template Store", verified: true },
      inStock: 999,
      isNew: false,
      isHot: true
    },
    {
      id: "related-2", 
      title: "PowerPoint Presentation Pack - Business & Marketing",
      price: { min: 199000, max: 399000 },
      image: "/placeholder.svg",
      category: "Templates",
      rating: 4.6,
      reviews: 89,
      seller: { name: "Design Pro", verified: true },
      inStock: 500,
      isNew: true,
      discount: 20
    },
    {
      id: "related-3",
      title: "Photoshop Actions Collection - 50+ Effects",
      price: { min: 149000, max: 149000 },
      image: "/placeholder.svg", 
      category: "Digital Tools",
      rating: 4.9,
      reviews: 234,
      seller: { name: "Creative Tools", verified: true },
      inStock: 888,
      isHot: true
    },
    {
      id: "related-4",
      title: "Social Media Templates - Instagram & Facebook",
      price: { min: 99000, max: 199000 },
      image: "/placeholder.svg",
      category: "Templates", 
      rating: 4.7,
      reviews: 67,
      seller: { name: "Social Media Pro", verified: false },
      inStock: 300,
      isNew: false
    }
  ];

  // Filter out current product and limit to 4 items
  const filteredProducts = relatedProducts
    .filter(product => product.id !== currentProductId)
    .slice(0, 4);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <EnhancedProductCard key={product.id} {...product} />
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;
