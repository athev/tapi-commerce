
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";

interface ProductDetailsAccordionProps {
  // Make props optional to handle any product structure
  [key: string]: any;
}

const ProductDetailsAccordion = (props: ProductDetailsAccordionProps) => {
  // Extract product from props if it exists, otherwise use props directly
  const product = props.product || props;

  return (
    <Card>
      <CardContent className="p-6">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="specifications">
            <AccordionTrigger>Thông số kỹ thuật</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Loại sản phẩm:</span>
                  <span>{product?.product_type || 'Không xác định'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Danh mục:</span>
                  <span>{product?.category || 'Không xác định'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Tình trạng:</span>
                  <span>{product?.in_stock > 0 ? 'Còn hàng' : 'Hết hàng'}</span>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="delivery">
            <AccordionTrigger>Thông tin giao hàng</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                <p>• Giao hàng ngay sau khi thanh toán thành công</p>
                <p>• Hỗ trợ 24/7 qua chat trực tiếp</p>
                <p>• Đảm bảo hoàn tiền nếu sản phẩm lỗi</p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="warranty">
            <AccordionTrigger>Bảo hành & Hỗ trợ</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                <p>• Bảo hành trọn đời sản phẩm</p>
                <p>• Hỗ trợ kỹ thuật 24/7</p>
                <p>• Cập nhật miễn phí các phiên bản mới</p>
                <p>• Hoàn tiền 100% trong 7 ngày đầu</p>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default ProductDetailsAccordion;
