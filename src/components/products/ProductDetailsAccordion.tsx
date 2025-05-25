
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Award, FileText, Store, Star } from "lucide-react";

interface ProductDetailsAccordionProps {
  description: string;
  productType: string;
  sellerName: string;
  sellerVerified?: boolean;
}

const ProductDetailsAccordion = ({ 
  description, 
  productType, 
  sellerName, 
  sellerVerified = true 
}: ProductDetailsAccordionProps) => {
  const getFeatures = (type: string) => {
    const features = {
      file_download: [
        "Tải về ngay lập tức sau khi thanh toán",
        "File chất lượng cao, đầy đủ tính năng", 
        "Hỗ trợ tất cả các định dạng phổ biến",
        "Cập nhật miễn phí trong 30 ngày"
      ],
      license_key_delivery: [
        "Mã kích hoạt chính hãng 100%",
        "Hướng dẫn kích hoạt chi tiết",
        "Hỗ trợ kỹ thuật 24/7",
        "Bảo hành theo chính sách nhà sản xuất"
      ],
      shared_account: [
        "Tài khoản premium được chia sẻ",
        "Truy cập đầy đủ tính năng",
        "Thời gian sử dụng theo gói đã chọn",
        "Hỗ trợ khi gặp sự cố"
      ],
      upgrade_account_no_pass: [
        "Nâng cấp tài khoản hiện tại",
        "Không cần đổi mật khẩu",
        "Giữ nguyên dữ liệu cá nhân",
        "Kích hoạt trong 5-10 phút"
      ],
      upgrade_account_with_pass: [
        "Nâng cấp tài khoản hiện tại",
        "Bao gồm thay đổi mật khẩu",
        "Bảo mật cao hơn",
        "Kích hoạt trong 10-15 phút"
      ]
    };
    return features[type as keyof typeof features] || [];
  };

  return (
    <div className="lg:hidden">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="description">
          <AccordionTrigger className="flex items-center space-x-2">
            <FileText className="h-4 w-4 text-marketplace-primary" />
            <span>Mô tả sản phẩm</span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {description}
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="features">
          <AccordionTrigger className="flex items-center space-x-2">
            <Award className="h-4 w-4 text-marketplace-primary" />
            <span>Tính năng nổi bật</span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {getFeatures(productType).map((feature, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-1.5 h-1.5 bg-marketplace-primary rounded-full mt-2 flex-shrink-0" />
                  <span className="text-gray-700 text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="warranty">
          <AccordionTrigger className="flex items-center space-x-2">
            <Shield className="h-4 w-4 text-marketplace-primary" />
            <span>Bảo hành & Cam kết</span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3">
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <h4 className="font-medium text-green-800 mb-1 text-sm">Bảo đảm chất lượng</h4>
                <p className="text-green-700 text-xs">
                  Hoàn tiền 100% nếu không hài lòng trong vòng 7 ngày.
                </p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-800 mb-1 text-sm">Bảo mật thông tin</h4>
                <p className="text-blue-700 text-xs">
                  Thông tin được bảo vệ bằng công nghệ mã hóa SSL 256-bit.
                </p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="seller">
          <AccordionTrigger className="flex items-center space-x-2">
            <Store className="h-4 w-4 text-marketplace-primary" />
            <span>Thông tin shop</span>
          </AccordionTrigger>
          <AccordionContent>
            <Card className="bg-gray-50 border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-marketplace-primary rounded-full flex items-center justify-center">
                    <Store className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-gray-900 text-sm">{sellerName}</h4>
                      {sellerVerified && (
                        <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-1 mt-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs text-gray-600">4.8 (1.2k đánh giá)</span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="text-center p-2 bg-white rounded border">
                    <div className="font-semibold text-gray-900">98%</div>
                    <div className="text-gray-600">Phản hồi</div>
                  </div>
                  <div className="text-center p-2 bg-white rounded border">
                    <div className="font-semibold text-gray-900">2h</div>
                    <div className="text-gray-600">Phản hồi</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default ProductDetailsAccordion;
