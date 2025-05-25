
interface SellerProductsHeaderProps {
  productCount: number;
}

const SellerProductsHeader = ({ productCount }: SellerProductsHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-semibold">Sản phẩm của tôi</h2>
      <div className="text-sm text-gray-500">
        Tổng cộng: {productCount} sản phẩm
      </div>
    </div>
  );
};

export default SellerProductsHeader;
