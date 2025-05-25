
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const SellerApplicationForm = () => {
  const { user, profile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    business_name: "",
    business_description: "",
    phone: "",
    address: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Bạn cần đăng nhập để gửi đăng ký");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('seller_applications')
        .insert({
          user_id: user.id,
          business_name: formData.business_name,
          business_description: formData.business_description,
          phone: formData.phone,
          address: formData.address,
          status: 'pending'
        });

      if (error) throw error;

      toast.success('Đăng ký người bán đã được gửi! Chúng tôi sẽ xem xét và phản hồi sớm nhất.');
      
      // Refresh the page to show the pending status
      window.location.reload();
    } catch (error: any) {
      console.error('Error submitting seller application:', error);
      toast.error('Có lỗi xảy ra khi gửi đăng ký. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Đăng ký trở thành người bán</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="business_name">Tên gian hàng *</Label>
            <Input
              id="business_name"
              value={formData.business_name}
              onChange={(e) => handleInputChange('business_name', e.target.value)}
              placeholder="Nhập tên gian hàng của bạn"
              required
            />
          </div>

          <div>
            <Label htmlFor="business_description">Mô tả gian hàng *</Label>
            <Textarea
              id="business_description"
              value={formData.business_description}
              onChange={(e) => handleInputChange('business_description', e.target.value)}
              placeholder="Mô tả ngắn về sản phẩm/dịch vụ bạn muốn bán"
              required
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="phone">Số điện thoại *</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="Nhập số điện thoại liên hệ"
              required
            />
          </div>

          <div>
            <Label htmlFor="address">Địa chỉ</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Nhập địa chỉ (tùy chọn)"
            />
          </div>

          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {isSubmitting ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></span>
                Đang gửi...
              </>
            ) : (
              'Gửi đăng ký'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SellerApplicationForm;
