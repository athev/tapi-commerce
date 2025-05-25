
import ProductFormAuthGuard from "./ProductFormAuthGuard";
import ProductFormContent from "./ProductFormContent";

const ProductForm = () => {
  return (
    <ProductFormAuthGuard>
      <ProductFormContent />
    </ProductFormAuthGuard>
  );
};

export default ProductForm;
