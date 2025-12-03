import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useSiteSettings, useUpdateSiteSetting } from "@/hooks/useSiteSettings";
import { Loader2, Upload, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const AdminBrandingSettings = () => {
  const { data: logoSetting, isLoading: logoLoading } = useSiteSettings('site_logo');
  const { data: nameSetting, isLoading: nameLoading } = useSiteSettings('site_name');
  const updateSetting = useUpdateSiteSetting();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [logoUrl, setLogoUrl] = useState('');
  const [logoAlt, setLogoAlt] = useState('');
  const [siteName, setSiteName] = useState('');
  const [siteShort, setSiteShort] = useState('');
  const [uploading, setUploading] = useState(false);

  // Fix: Use useEffect to initialize form when data loads
  useEffect(() => {
    if (logoSetting && !Array.isArray(logoSetting)) {
      setLogoUrl(logoSetting.value.url || '');
      setLogoAlt(logoSetting.value.alt || '');
    }
  }, [logoSetting]);

  useEffect(() => {
    if (nameSetting && !Array.isArray(nameSetting)) {
      setSiteName(nameSetting.value.text || '');
      setSiteShort(nameSetting.value.short || '');
    }
  }, [nameSetting]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file hình ảnh');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File không được vượt quá 2MB');
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `site-logo-${Date.now()}.${fileExt}`;
      const filePath = `branding/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('shop-avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('shop-avatars')
        .getPublicUrl(filePath);

      setLogoUrl(publicUrl);
      toast.success('Upload logo thành công');
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error('Có lỗi khi upload logo');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveLogo = () => {
    updateSetting.mutate({
      key: 'site_logo',
      value: { url: logoUrl, alt: logoAlt }
    });
  };

  const handleSaveName = () => {
    updateSetting.mutate({
      key: 'site_name',
      value: { text: siteName, short: siteShort }
    });
  };

  if (logoLoading || nameLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Logo Website</CardTitle>
          <CardDescription>
            Cập nhật logo hiển thị trên header
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Upload Logo</Label>
            <div className="flex items-center gap-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                {uploading ? 'Đang upload...' : 'Chọn file'}
              </Button>
              <span className="text-sm text-muted-foreground">
                PNG, JPG, SVG (tối đa 2MB)
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo-url">Hoặc nhập URL Logo</Label>
            <Input
              id="logo-url"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="/lovable-uploads/logo.png"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="logo-alt">Alt Text</Label>
            <Input
              id="logo-alt"
              value={logoAlt}
              onChange={(e) => setLogoAlt(e.target.value)}
              placeholder="Logo"
            />
          </div>
          {logoUrl && (
            <div className="border rounded-lg p-4 bg-muted/50">
              <p className="text-sm text-muted-foreground mb-2">Preview:</p>
              <div className="flex items-center gap-4">
                <img src={logoUrl} alt={logoAlt} className="h-12 object-contain" />
                <div className="flex items-center gap-2 bg-primary rounded-lg p-2">
                  <img src={logoUrl} alt={logoAlt} className="h-8 object-contain" />
                  <span className="text-primary-foreground font-bold">{siteName || 'Tên Website'}</span>
                </div>
              </div>
            </div>
          )}
          <Button onClick={handleSaveLogo} disabled={updateSetting.isPending}>
            {updateSetting.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Lưu Logo
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tên Website</CardTitle>
          <CardDescription>
            Cập nhật tên hiển thị của website
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="site-name">Tên đầy đủ</Label>
            <Input
              id="site-name"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              placeholder="Sàn Sản Phẩm Số"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="site-short">Tên rút gọn (hiển thị khi không có logo)</Label>
            <Input
              id="site-short"
              value={siteShort}
              onChange={(e) => setSiteShort(e.target.value)}
              placeholder="SPS"
            />
          </div>
          <Button onClick={handleSaveName} disabled={updateSetting.isPending}>
            {updateSetting.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Lưu Tên
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
