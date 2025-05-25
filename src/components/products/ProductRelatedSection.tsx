
import RelatedProducts from "./RelatedProducts";

interface ProductRelatedSectionProps {
  currentProductId: string;
  category: string;
}

const ProductRelatedSection = ({
  currentProductId,
  category
}: ProductRelatedSectionProps) => {
  return (
    <div className="container py-6">
      <RelatedProducts 
        currentProductId={currentProductId} 
        category={category} 
      />
    </div>
  );
};

export default ProductRelatedSection;
