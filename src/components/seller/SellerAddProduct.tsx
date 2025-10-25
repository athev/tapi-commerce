
import ProductCreationWizard from "./ProductCreationWizard";
import { Card, CardContent } from "@/components/ui/card";
import { Package, Lightbulb } from "lucide-react";

const SellerAddProduct = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2 flex items-center">
          <Package className="h-6 w-6 mr-2 text-primary" />
          Thêm sản phẩm mới
        </h2>
        <p className="text-muted-foreground">
          Tạo sản phẩm số mới để bán trên gian hàng của bạn
        </p>
      </div>
      
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Lightbulb className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium mb-1">Mẹo tạo sản phẩm hiệu quả</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Sử dụng tên sản phẩm mô tả rõ ràng và hấp dẫn</li>
                <li>• Tạo nhiều gói giá để tăng doanh số</li>
                <li>• Chọn ảnh đại diện chất lượng cao, rõ nét</li>
                <li>• Viết mô tả chi tiết về giá trị sản phẩm</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <ProductCreationWizard />
    </div>
  );
};

export default SellerAddProduct;
