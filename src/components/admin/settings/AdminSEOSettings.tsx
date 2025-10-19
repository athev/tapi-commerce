import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useSiteSettings, useUpdateSiteSetting } from "@/hooks/useSiteSettings";
import { Loader2 } from "lucide-react";

export const AdminSEOSettings = () => {
  const { data: titleSetting, isLoading: titleLoading } = useSiteSettings('site_title');
  const { data: descSetting, isLoading: descLoading } = useSiteSettings('site_description');
  const updateSetting = useUpdateSiteSetting();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (titleSetting && !Array.isArray(titleSetting)) {
      setTitle(titleSetting.value.text || '');
    }
    if (descSetting && !Array.isArray(descSetting)) {
      setDescription(descSetting.value.text || '');
    }
  }, [titleSetting, descSetting]);

  const handleSave = () => {
    updateSetting.mutate({
      key: 'site_title',
      value: { text: title }
    });
    updateSetting.mutate({
      key: 'site_description',
      value: { text: description }
    });
  };

  if (titleLoading || descLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cài đặt SEO</CardTitle>
        <CardDescription>
          Quản lý thông tin SEO của website (Title, Meta Description)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="seo-title">Title Tag</Label>
          <Input
            id="seo-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Sàn sản phẩm số đầu tiên tại Việt Nam..."
            maxLength={60}
          />
          <p className="text-xs text-muted-foreground">
            {title.length}/60 ký tự (tối ưu cho SEO)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="seo-desc">Meta Description</Label>
          <Textarea
            id="seo-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Nơi mua bán các sản phẩm số..."
            maxLength={160}
            rows={3}
          />
          <p className="text-xs text-muted-foreground">
            {description.length}/160 ký tự (tối ưu cho SEO)
          </p>
        </div>

        <Button onClick={handleSave} disabled={updateSetting.isPending}>
          {updateSetting.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Lưu Cài Đặt SEO
        </Button>
      </CardContent>
    </Card>
  );
};
