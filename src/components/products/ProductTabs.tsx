
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Download, HelpCircle, FileText, Settings } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface ProductTabsProps {
  description: string;
  productType: string;
}

const ProductTabs = ({ description, productType }: ProductTabsProps) => {
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

  const getFAQ = (type: string) => {
    const faqs = {
      file_download: [
        {
          question: "Làm sao để tải file sau khi mua?",
          answer: "Sau khi thanh toán thành công, bạn sẽ nhận được link tải về qua email và có thể tải trực tiếp trên trang sản phẩm."
        },
        {
          question: "File có thời hạn sử dụng không?",
          answer: "File tải về không có thời hạn, bạn có thể sử dụng vĩnh viễn sau khi mua."
        },
        {
          question: "Nếu file bị lỗi thì sao?",
          answer: "Chúng tôi cam kết hoàn tiền 100% nếu file có lỗi không thể sử dụng được."
        }
      ],
      license_key_delivery: [
        {
          question: "Mã kích hoạt có thời hạn không?",
          answer: "Thời hạn của mã kích hoạt phụ thuộc vào sản phẩm cụ thể, thông tin chi tiết sẽ được ghi rõ trong mô tả."
        },
        {
          question: "Có hướng dẫn cài đặt không?",
          answer: "Có, chúng tôi cung cấp hướng dẫn chi tiết từng bước và hỗ trợ kỹ thuật."
        }
      ]
    };
    return faqs[type as keyof typeof faqs] || [];
  };

  return (
    <Tabs defaultValue="description" className="w-full">
      <div className="sticky top-16 z-10 bg-background border-b mb-6">
        <TabsList className="grid w-full grid-cols-5 rounded-none h-12">
          <TabsTrigger value="description">Mô tả</TabsTrigger>
          <TabsTrigger value="features">Tính năng</TabsTrigger>
          <TabsTrigger value="guide">Hướng dẫn</TabsTrigger>
          <TabsTrigger value="guarantee">Cam kết</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="description" className="mt-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <FileText className="h-5 w-5 text-marketplace-primary" />
              <h3 className="text-lg font-semibold">Mô tả chi tiết</h3>
            </div>
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {description}
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="features" className="mt-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Settings className="h-5 w-5 text-marketplace-primary" />
              <h3 className="text-lg font-semibold">Tính năng nổi bật</h3>
            </div>
            <div className="space-y-3">
              {getFeatures(productType).map((feature, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-marketplace-primary rounded-full mt-2 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="guide" className="mt-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Download className="h-5 w-5 text-marketplace-primary" />
              <h3 className="text-lg font-semibold">Hướng dẫn sử dụng</h3>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">1. Sau khi mua hàng:</h4>
                <p className="text-gray-700 text-sm">
                  Bạn sẽ nhận được thông tin sản phẩm qua email và có thể xem chi tiết trong mục "Đơn hàng của tôi".
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">2. Sử dụng sản phẩm:</h4>
                <p className="text-gray-700 text-sm">
                  Làm theo hướng dẫn chi tiết được cung cấp. Nếu gặp khó khăn, vui lòng liên hệ bộ phận hỗ trợ.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">3. Hỗ trợ kỹ thuật:</h4>
                <p className="text-gray-700 text-sm">
                  Đội ngũ hỗ trợ 24/7 sẵn sàng giúp đỡ qua chat hoặc email. Thời gian phản hồi trung bình dưới 1 giờ.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="guarantee" className="mt-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="h-5 w-5 text-marketplace-primary" />
              <h3 className="text-lg font-semibold">Cam kết của chúng tôi</h3>
            </div>
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-medium text-green-800 mb-2">Bảo đảm chất lượng</h4>
                <p className="text-green-700 text-sm">
                  Chúng tôi cam kết 100% sản phẩm chính hãng, chất lượng cao. 
                  Nếu không hài lòng, hoàn tiền trong vòng 7 ngày.
                </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-800 mb-2">Bảo mật thông tin</h4>
                <p className="text-blue-700 text-sm">
                  Thông tin cá nhân và thanh toán của bạn được bảo vệ bằng 
                  công nghệ mã hóa SSL 256-bit.
                </p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <h4 className="font-medium text-orange-800 mb-2">Hỗ trợ 24/7</h4>
                <p className="text-orange-700 text-sm">
                  Đội ngũ hỗ trợ khách hàng luôn sẵn sàng giúp đỡ bạn 
                  24/7 qua chat, email hoặc điện thoại.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="faq" className="mt-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <HelpCircle className="h-5 w-5 text-marketplace-primary" />
              <h3 className="text-lg font-semibold">Câu hỏi thường gặp</h3>
            </div>
            <Accordion type="single" collapsible className="w-full">
              {getFAQ(productType).map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-700">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default ProductTabs;
