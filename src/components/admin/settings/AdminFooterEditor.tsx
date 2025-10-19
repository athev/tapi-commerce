import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useSiteSettings, useUpdateSiteSetting } from "@/hooks/useSiteSettings";
import { Loader2 } from "lucide-react";

export const AdminFooterEditor = () => {
  const { data: companyInfo, isLoading: companyLoading } = useSiteSettings('company_info');
  const { data: contactInfo, isLoading: contactLoading } = useSiteSettings('contact_info');
  const updateSetting = useUpdateSiteSetting();

  const [companyName, setCompanyName] = useState('');
  const [companyDesc, setCompanyDesc] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactHours, setContactHours] = useState('');

  useEffect(() => {
    if (companyInfo && !Array.isArray(companyInfo)) {
      setCompanyName(companyInfo.value.name || '');
      setCompanyDesc(companyInfo.value.description || '');
    }
    if (contactInfo && !Array.isArray(contactInfo)) {
      setContactEmail(contactInfo.value.email || '');
      setContactHours(contactInfo.value.hours || '');
    }
  }, [companyInfo, contactInfo]);

  const handleSave = () => {
    updateSetting.mutate({
      key: 'company_info',
      value: { name: companyName, description: companyDesc }
    });
    updateSetting.mutate({
      key: 'contact_info',
      value: { email: contactEmail, hours: contactHours }
    });
  };

  if (companyLoading || contactLoading) {
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
          <CardTitle>Thông tin Công ty</CardTitle>
          <CardDescription>Hiển thị trong footer</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company-name">Tên công ty</Label>
            <Input
              id="company-name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="DigitalMarket"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company-desc">Mô tả</Label>
            <Textarea
              id="company-desc"
              value={companyDesc}
              onChange={(e) => setCompanyDesc(e.target.value)}
              placeholder="Sàn thương mại điện tử..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin Liên hệ</CardTitle>
          <CardDescription>Email và giờ hỗ trợ</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contact-email">Email liên hệ</Label>
            <Input
              id="contact-email"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="support@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-hours">Giờ hỗ trợ</Label>
            <Input
              id="contact-hours"
              value={contactHours}
              onChange={(e) => setContactHours(e.target.value)}
              placeholder="08:00 - 22:00"
            />
          </div>
          <Button onClick={handleSave} disabled={updateSetting.isPending}>
            {updateSetting.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Lưu Thông Tin Footer
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
