
import ProductReviews from "./ProductReviews";

interface ProductReviewsSectionProps {
  reviews?: any[];
  averageRating?: number;
  totalReviews?: number;
}

const ProductReviewsSection = ({
  reviews = [],
  averageRating = 4.8,
  totalReviews = 156
}: ProductReviewsSectionProps) => {
  return (
    <div className="bg-gray-50 border-t">
      <div className="container py-6 lg:py-8">
        <ProductReviews 
          reviews={reviews} 
          averageRating={averageRating} 
          totalReviews={totalReviews} 
        />
      </div>
    </div>
  );
};

export default ProductReviewsSection;
