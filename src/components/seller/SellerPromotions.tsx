
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Percent, Calendar, Gift } from "lucide-react";
import { toast } from "sonner";

const SellerPromotions = () => {
  const [promotions] = useState([
    {
      id: 1,
      name: "Giảm giá mùa hè",
      type: "percentage",
      value: 20,
      startDate: "2024-06-01",
      endDate: "2024-08-31",
      status: "active",
      products: 5
    },
    {
      id: 2,
      name: "Flash Sale",
      type: "fixed",
      value: 50000,
      startDate: "2024-05-01",
      endDate: "2024-05-15",
      status: "expired",
      products: 3
    }
  ]);

  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleCreatePromotion = () => {
    toast.success("Chương trình khuyến mãi đã được tạo!");
    setShowCreateForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Khuyến mãi & Giảm giá</h2>
        <Button 
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Tạo khuyến mãi
        </Button>
      </div>

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Tạo chương trình khuyến mãi mới</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="promo-name">Tên chương trình</Label>
                <Input id="promo-name" placeholder="Nhập tên chương trình..." />
              </div>
              <div>
                <Label htmlFor="promo-type">Loại giảm giá</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Phần trăm (%)</SelectItem>
                    <SelectItem value="fixed">Số tiền cố định (VND)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="promo-value">Giá trị</Label>
                <Input id="promo-value" type="number" placeholder="0" />
              </div>
              <div>
                <Label htmlFor="promo-start">Ngày bắt đầu</Label>
                <Input id="promo-start" type="date" />
              </div>
              <div>
                <Label htmlFor="promo-end">Ngày kết thúc</Label>
                <Input id="promo-end" type="date" />
              </div>
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleCreatePromotion}>Tạo khuyến mãi</Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Hủy
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {promotions.map((promo) => (
          <Card key={promo.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Gift className="h-5 w-5 text-green-600" />
                    <h3 className="font-semibold">{promo.name}</h3>
                    <Badge variant={promo.status === 'active' ? 'default' : 'secondary'}>
                      {promo.status === 'active' ? 'Đang chạy' : 'Đã hết hạn'}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Percent className="h-4 w-4 mr-1" />
                      {promo.type === 'percentage' ? `${promo.value}%` : `${promo.value.toLocaleString('vi-VN')}đ`}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(promo.startDate).toLocaleDateString('vi-VN')} - {new Date(promo.endDate).toLocaleDateString('vi-VN')}
                    </div>
                    <span>{promo.products} sản phẩm</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">Sửa</Button>
                  <Button variant="destructive" size="sm">Xóa</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SellerPromotions;
