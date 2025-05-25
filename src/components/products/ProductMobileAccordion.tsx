
import ProductHighlights from "./ProductHighlights";
import ProductDetailsAccordion from "./ProductDetailsAccordion";

interface ProductMobileAccordionProps {
  productType: string;
  description: string;
  sellerName: string;
}

const ProductMobileAccordion = ({
  productType,
  description,
  sellerName
}: ProductMobileAccordionProps) => {
  return (
    <div className="lg:hidden container py-4 space-y-4">
      <ProductHighlights productType={productType} />
      
      <ProductDetailsAccordion 
        description={description} 
        productType={productType} 
        sellerName={sellerName}
      />
    </div>
  );
};

export default ProductMobileAccordion;
