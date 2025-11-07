import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Store, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const SellerShopInfoEditor = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const profileData = profile as any;
  const [formData, setFormData] = useState({
    full_name: profileData?.full_name || "",
    shop_description: profileData?.shop_description || "",
    phone: profileData?.phone || "",
    address: profileData?.address || "",
  });
  const [avatarUrl, setAvatarUrl] = useState(profileData?.avatar || "");

  useEffect(() => {
    if (profile) {
      const profileData = profile as any;
      setFormData({
        full_name: profileData.full_name || "",
        shop_description: profileData.shop_description || "",
        phone: profileData.phone || "",
        address: profileData.address || "",
      });
      setAvatarUrl(profileData.avatar || "");
    }
  }, [profile]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File quá lớn. Vui lòng chọn file dưới 5MB.");
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from('shop-avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('shop-avatars')
        .getPublicUrl(fileName);

      setAvatarUrl(publicUrl);
      toast.success("Upload ảnh thành công!");
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast.error("Lỗi khi upload ảnh. Vui lòng thử lại.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          shop_description: formData.shop_description,
          phone: formData.phone,
          address: formData.address,
          avatar: avatarUrl,
        })
        .eq('id', user.id);

      if (error) throw error;

      await refreshProfile();
      toast.success("Cập nhật thông tin shop thành công!");
    } catch (error: any) {
      console.error('Error updating shop info:', error);
      toast.error("Lỗi khi cập nhật thông tin. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Store className="h-5 w-5 mr-2" />
          Thông tin gian hàng
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Upload */}
          <div className="flex items-center space-x-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback>
                {formData.full_name?.charAt(0)?.toUpperCase() || 'S'}
              </AvatarFallback>
            </Avatar>
            <div>
              <Label htmlFor="avatar-upload" className="cursor-pointer">
                <div className="flex items-center space-x-2 px-4 py-2 border rounded-md hover:bg-accent">
                  {isUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                  <span className="text-sm">
                    {isUploading ? "Đang upload..." : "Thay đổi ảnh đại diện"}
                  </span>
                </div>
              </Label>
              <Input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                disabled={isUploading}
                className="hidden"
              />
              <p className="text-xs text-muted-foreground mt-1">
                JPG, PNG hoặc GIF. Tối đa 5MB.
              </p>
            </div>
          </div>

          {/* Shop Name */}
          <div className="space-y-2">
            <Label htmlFor="full_name">Tên gian hàng *</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="Nhập tên gian hàng của bạn"
              required
            />
          </div>

          {/* Shop Description */}
          <div className="space-y-2">
            <Label htmlFor="shop_description">Mô tả gian hàng</Label>
            <Textarea
              id="shop_description"
              value={formData.shop_description}
              onChange={(e) => setFormData({ ...formData, shop_description: e.target.value })}
              placeholder="Giới thiệu về gian hàng của bạn..."
              rows={4}
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Số điện thoại</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Nhập số điện thoại liên hệ"
            />
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">Địa chỉ</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Nhập địa chỉ"
            />
          </div>

          <Button type="submit" disabled={isLoading || isUploading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Đang lưu...
              </>
            ) : (
              "Lưu thay đổi"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SellerShopInfoEditor;
