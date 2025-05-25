
import { Badge } from "@/components/ui/badge";

export const getDeliveryStatusBadge = (status: string) => {
  switch (status) {
    case 'delivered':
      return <Badge className="bg-green-500">Đã giao</Badge>;
    case 'failed':
      return <Badge className="bg-red-500">Thất bại</Badge>;
    default:
      return <Badge className="bg-yellow-500">Chờ xử lý</Badge>;
  }
};

export const getOrderStatusBadge = (status: string) => {
  switch (status) {
    case 'paid':
      return <Badge className="bg-green-500">Đã thanh toán</Badge>;
    case 'pending':
      return <Badge className="bg-yellow-500">Chờ thanh toán</Badge>;
    case 'cancelled':
      return <Badge className="bg-red-500">Đã hủy</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};
