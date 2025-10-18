import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Label } from "@/components/ui/label";

interface OrdersFiltersProps {
  statusFilter: string;
  deliveryFilter: string;
  searchQuery: string;
  onStatusChange: (value: string) => void;
  onDeliveryChange: (value: string) => void;
  onSearchChange: (value: string) => void;
}

const OrdersFilters = ({
  statusFilter,
  deliveryFilter,
  searchQuery,
  onStatusChange,
  onDeliveryChange,
  onSearchChange,
}: OrdersFiltersProps) => {
  return (
    <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search">Tìm kiếm</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="ID, email, sản phẩm..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Payment Status Filter */}
        <div className="space-y-2">
          <Label htmlFor="status-filter">Trạng thái thanh toán</Label>
          <Select value={statusFilter} onValueChange={onStatusChange}>
            <SelectTrigger id="status-filter">
              <SelectValue placeholder="Tất cả" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="pending">Chờ thanh toán</SelectItem>
              <SelectItem value="paid">Đã thanh toán</SelectItem>
              <SelectItem value="cancelled">Đã hủy</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Delivery Status Filter */}
        <div className="space-y-2">
          <Label htmlFor="delivery-filter">Trạng thái giao hàng</Label>
          <Select value={deliveryFilter} onValueChange={onDeliveryChange}>
            <SelectTrigger id="delivery-filter">
              <SelectValue placeholder="Tất cả" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="pending">Chờ xử lý</SelectItem>
              <SelectItem value="processing">Đang xử lý</SelectItem>
              <SelectItem value="delivered">Đã giao</SelectItem>
              <SelectItem value="failed">Thất bại</SelectItem>
              <SelectItem value="disputed">Khiếu nại</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default OrdersFilters;
