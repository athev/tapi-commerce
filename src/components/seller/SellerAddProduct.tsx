
import ProductForm from "./ProductForm";
import { Card, CardContent } from "@/components/ui/card";
import { Package, Lightbulb } from "lucide-react";

const SellerAddProduct = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2 flex items-center">
          <Package className="h-6 w-6 mr-2 text-green-600" />
          Thêm sản phẩm mới
        </h2>
        <p className="text-gray-600">
          Tạo sản phẩm số mới để bán trên gian hàng của bạn
        </p>
      </div>
      
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-blue-900 mb-1">Mẹo tạo sản phẩm hiệu quả</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Sử dụng tên sản phẩm mô tả rõ ràng và hấp dẫn</li>
                <li>• Viết mô tả chi tiết về giá trị mà sản phẩm mang lại</li>
                <li>• Chọn ảnh đại diện chất lượng cao, rõ nét</li>
                <li>• Đặt giá cạnh tranh phù hợp với thị trường</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <ProductForm />
    </div>
  );
};

export default SellerAddProduct;
