import { Shield, Clock, RefreshCw, Headphones, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const HELP_ITEMS = [
  {
    icon: Shield,
    title: 'Bảo vệ giao dịch',
    description: 'Mọi đơn hàng được bảo vệ 100%'
  },
  {
    icon: Clock,
    title: 'Giao hàng nhanh',
    description: 'Nhận sản phẩm ngay sau thanh toán'
  },
  {
    icon: RefreshCw,
    title: 'Hoàn tiền dễ dàng',
    description: 'Đảm bảo hoàn tiền trong 7 ngày'
  },
  {
    icon: Headphones,
    title: 'Hỗ trợ 24/7',
    description: 'Luôn sẵn sàng hỗ trợ bạn'
  }
];

export const QuickHelpSection = () => {
  return (
    <section className="bg-gradient-to-br from-primary/5 to-primary/10 py-12">
      <div className="container mx-auto px-4">
        <h2 className="section-title text-center">
          Tại Sao Chọn Chúng Tôi?
        </h2>
        <p className="section-subtitle text-center max-w-2xl mx-auto">
          Cam kết mang đến trải nghiệm mua sắm an toàn, nhanh chóng và đáng tin cậy
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          {HELP_ITEMS.map((item) => (
            <Card key={item.title} className="text-center p-6 hover:shadow-lg transition-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <item.icon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-8">
          <Button variant="outline" size="lg" asChild>
            <Link to="/help">
              Xem hướng dẫn mua hàng
              <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
