import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useSiteSettings, useUpdateSiteSetting } from "@/hooks/useSiteSettings";
import { Loader2 } from "lucide-react";

export const AdminBrandingSettings = () => {
  const { data: logoSetting, isLoading: logoLoading } = useSiteSettings('site_logo');
  const { data: nameSetting, isLoading: nameLoading } = useSiteSettings('site_name');
  const updateSetting = useUpdateSiteSetting();

  const [logoUrl, setLogoUrl] = useState('');
  const [logoAlt, setLogoAlt] = useState('');
  const [siteName, setSiteName] = useState('');
  const [siteShort, setSiteShort] = useState('');

  // Initialize form when data loads
  useState(() => {
    if (logoSetting && !Array.isArray(logoSetting)) {
      setLogoUrl(logoSetting.value.url || '');
      setLogoAlt(logoSetting.value.alt || '');
    }
    if (nameSetting && !Array.isArray(nameSetting)) {
      setSiteName(nameSetting.value.text || '');
      setSiteShort(nameSetting.value.short || '');
    }
  });

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
          <div className="space-y-2">
            <Label htmlFor="logo-url">URL Logo</Label>
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
            <div className="border rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-2">Preview:</p>
              <img src={logoUrl} alt={logoAlt} className="h-12 object-contain" />
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
            <Label htmlFor="site-short">Tên rút gọn</Label>
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
