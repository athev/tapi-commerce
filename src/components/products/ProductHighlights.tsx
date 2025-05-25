
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Shield, Zap, Award, Clock, Users } from "lucide-react";

interface ProductHighlightsProps {
  productType: string;
}

const ProductHighlights = ({ productType }: ProductHighlightsProps) => {
  const getHighlights = (type: string) => {
    const highlights = {
      file_download: [
        {
          icon: Download,
          title: "Tải về ngay lập tức",
          description: "File chất lượng cao, tải về ngay sau thanh toán"
        },
        {
          icon: Shield,
          title: "File an toàn 100%",
          description: "Đã được kiểm tra virus, không chứa mã độc"
        },
        {
          icon: Award,
          title: "Bản quyền đầy đủ",
          description: "Sử dụng thương mại, chỉnh sửa tự do"
        }
      ],
      license_key_delivery: [
        {
          icon: Zap,
          title: "Kích hoạt nhanh chóng",
          description: "Nhận mã và hướng dẫn trong 5 phút"
        },
        {
          icon: Shield,
          title: "Mã chính hãng 100%",
          description: "Cam kết mã kích hoạt từ nhà phát triển"
        },
        {
          icon: Users,
          title: "Hỗ trợ 24/7",
          description: "Đội ngũ kỹ thuật luôn sẵn sàng hỗ trợ"
        }
      ],
      shared_account: [
        {
          icon: Users,
          title: "Tài khoản premium",
          description: "Truy cập đầy đủ tính năng cao cấp"
        },
        {
          icon: Clock,
          title: "Thời gian sử dụng rõ ràng",
          description: "Cam kết thời gian theo gói đã chọn"
        },
        {
          icon: Shield,
          title: "Bảo mật tuyệt đối",
          description: "Không thu thập thông tin cá nhân"
        }
      ],
      upgrade_account_no_pass: [
        {
          icon: Zap,
          title: "Nâng cấp nhanh",
          description: "Kích hoạt trong 5-10 phút"
        },
        {
          icon: Shield,
          title: "Giữ nguyên dữ liệu",
          description: "Không mất thông tin cá nhân hiện tại"
        },
        {
          icon: Award,
          title: "Không đổi mật khẩu",
          description: "An toàn và tiện lợi cho người dùng"
        }
      ],
      upgrade_account_with_pass: [
        {
          icon: Shield,
          title: "Bảo mật cao cấp",
          description: "Thay đổi mật khẩu để bảo vệ tối đa"
        },
        {
          icon: Zap,
          title: "Nâng cấp an toàn",
          description: "Quy trình bảo mật 2 lớp"
        },
        {
          icon: Award,
          title: "Quyền sở hữu hoàn toàn",
          description: "Tài khoản thuộc về bạn 100%"
        }
      ]
    };
    return highlights[type as keyof typeof highlights] || highlights.file_download;
  };

  const highlights = getHighlights(productType);

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-blue-900">Điểm nổi bật</CardTitle>
          <Badge className="bg-blue-600 text-white">Bán chạy</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {highlights.map((highlight, index) => {
          const IconComponent = highlight.icon;
          return (
            <div key={index} className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-blue-100">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <IconComponent className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 mb-1">{highlight.title}</h4>
                <p className="text-sm text-gray-600">{highlight.description}</p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default ProductHighlights;
