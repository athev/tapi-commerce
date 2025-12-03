import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useSiteSettings, useUpdateSiteSetting, useCreateSiteSetting } from "@/hooks/useSiteSettings";
import { Loader2, Plus, Trash2, Facebook, MessageCircle, Youtube, Send } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface FooterLink {
  label: string;
  url: string;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

export const AdminFooterEditor = () => {
  const { data: companyInfo, isLoading: companyLoading } = useSiteSettings('company_info');
  const { data: contactInfo, isLoading: contactLoading } = useSiteSettings('contact_info');
  const { data: footerLinks, isLoading: linksLoading } = useSiteSettings('footer_links');
  const { data: socialLinks, isLoading: socialLoading } = useSiteSettings('social_links');
  const { data: copyrightSetting, isLoading: copyrightLoading } = useSiteSettings('copyright_text');
  
  const updateSetting = useUpdateSiteSetting();
  const createSetting = useCreateSiteSetting();

  // Company info state
  const [companyName, setCompanyName] = useState('');
  const [companyDesc, setCompanyDesc] = useState('');

  // Contact info state
  const [contactEmail, setContactEmail] = useState('');
  const [contactHours, setContactHours] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactAddress, setContactAddress] = useState('');

  // Footer links state
  const [columns, setColumns] = useState<FooterColumn[]>([
    { title: "Liên kết", links: [{ label: "", url: "" }] },
    { title: "Hỗ trợ", links: [{ label: "", url: "" }] }
  ]);

  // Social links state
  const [facebook, setFacebook] = useState('');
  const [zalo, setZalo] = useState('');
  const [youtube, setYoutube] = useState('');
  const [telegram, setTelegram] = useState('');

  // Copyright state
  const [copyrightText, setCopyrightText] = useState('');

  // Load data into form
  useEffect(() => {
    if (companyInfo && !Array.isArray(companyInfo)) {
      setCompanyName(companyInfo.value?.name || '');
      setCompanyDesc(companyInfo.value?.description || '');
    }
  }, [companyInfo]);

  useEffect(() => {
    if (contactInfo && !Array.isArray(contactInfo)) {
      setContactEmail(contactInfo.value?.email || '');
      setContactHours(contactInfo.value?.hours || '');
      setContactPhone(contactInfo.value?.phone || '');
      setContactAddress(contactInfo.value?.address || '');
    }
  }, [contactInfo]);

  useEffect(() => {
    if (footerLinks && !Array.isArray(footerLinks) && footerLinks.value?.columns) {
      // Normalize data: convert 'path' to 'url' for consistency
      const normalizedColumns = footerLinks.value.columns.map((col: any) => ({
        ...col,
        links: col.links.map((link: any) => ({
          label: link.label || '',
          url: link.url || link.path || ''
        }))
      }));
      setColumns(normalizedColumns);
    }
  }, [footerLinks]);

  useEffect(() => {
    if (socialLinks && !Array.isArray(socialLinks)) {
      setFacebook(socialLinks.value?.facebook || '');
      setZalo(socialLinks.value?.zalo || '');
      setYoutube(socialLinks.value?.youtube || '');
      setTelegram(socialLinks.value?.telegram || '');
    }
  }, [socialLinks]);

  useEffect(() => {
    if (copyrightSetting && !Array.isArray(copyrightSetting)) {
      setCopyrightText(copyrightSetting.value?.text || '');
    }
  }, [copyrightSetting]);

  // Handlers for footer links
  const addColumn = () => {
    setColumns([...columns, { title: "Cột mới", links: [{ label: "", url: "" }] }]);
  };

  const removeColumn = (columnIndex: number) => {
    setColumns(columns.filter((_, i) => i !== columnIndex));
  };

  const updateColumnTitle = (columnIndex: number, title: string) => {
    const newColumns = [...columns];
    newColumns[columnIndex].title = title;
    setColumns(newColumns);
  };

  const addLink = (columnIndex: number) => {
    const newColumns = [...columns];
    newColumns[columnIndex].links.push({ label: "", url: "" });
    setColumns(newColumns);
  };

  const removeLink = (columnIndex: number, linkIndex: number) => {
    const newColumns = [...columns];
    newColumns[columnIndex].links = newColumns[columnIndex].links.filter((_, i) => i !== linkIndex);
    setColumns(newColumns);
  };

  const updateLink = (columnIndex: number, linkIndex: number, field: 'label' | 'url', value: string) => {
    const newColumns = [...columns];
    newColumns[columnIndex].links[linkIndex][field] = value;
    setColumns(newColumns);
  };

  // Save handlers
  const handleSaveCompany = () => {
    updateSetting.mutate({
      key: 'company_info',
      value: { name: companyName, description: companyDesc }
    });
  };

  const handleSaveContact = () => {
    updateSetting.mutate({
      key: 'contact_info',
      value: { 
        email: contactEmail, 
        hours: contactHours,
        phone: contactPhone,
        address: contactAddress
      }
    });
  };

  const handleSaveLinks = () => {
    // Filter out empty links
    const filteredColumns = columns.map(col => ({
      ...col,
      links: col.links.filter(link => link.label && link.url)
    }));

    if (footerLinks && !Array.isArray(footerLinks)) {
      updateSetting.mutate({
        key: 'footer_links',
        value: { columns: filteredColumns }
      });
    } else {
      createSetting.mutate({
        key: 'footer_links',
        value: { columns: filteredColumns },
        category: 'footer',
        description: 'Footer navigation links'
      });
    }
  };

  const handleSaveSocial = () => {
    const socialData = {
      facebook: facebook || null,
      zalo: zalo || null,
      youtube: youtube || null,
      telegram: telegram || null
    };

    if (socialLinks && !Array.isArray(socialLinks)) {
      updateSetting.mutate({
        key: 'social_links',
        value: socialData
      });
    } else {
      createSetting.mutate({
        key: 'social_links',
        value: socialData,
        category: 'footer',
        description: 'Social media links'
      });
    }
  };

  const handleSaveCopyright = () => {
    if (copyrightSetting && !Array.isArray(copyrightSetting)) {
      updateSetting.mutate({
        key: 'copyright_text',
        value: { text: copyrightText }
      });
    } else {
      createSetting.mutate({
        key: 'copyright_text',
        value: { text: copyrightText },
        category: 'footer',
        description: 'Copyright text displayed in footer'
      });
    }
  };

  const isLoading = companyLoading || contactLoading || linksLoading || socialLoading || copyrightLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Company Info */}
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
          <Button onClick={handleSaveCompany} disabled={updateSetting.isPending}>
            {updateSetting.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Lưu Thông Tin Công Ty
          </Button>
        </CardContent>
      </Card>

      {/* Contact Info */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin Liên hệ</CardTitle>
          <CardDescription>Email, giờ làm việc, hotline...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <div className="space-y-2">
              <Label htmlFor="contact-phone">Hotline</Label>
              <Input
                id="contact-phone"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="1900 xxxx"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-address">Địa chỉ</Label>
              <Input
                id="contact-address"
                value={contactAddress}
                onChange={(e) => setContactAddress(e.target.value)}
                placeholder="123 Đường ABC, Quận 1, TP.HCM"
              />
            </div>
          </div>
          <Button onClick={handleSaveContact} disabled={updateSetting.isPending}>
            {updateSetting.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Lưu Thông Tin Liên Hệ
          </Button>
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card>
        <CardHeader>
          <CardTitle>Mạng Xã Hội</CardTitle>
          <CardDescription>Liên kết đến các trang mạng xã hội</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="social-facebook" className="flex items-center gap-2">
                <Facebook className="h-4 w-4" /> Facebook
              </Label>
              <Input
                id="social-facebook"
                value={facebook}
                onChange={(e) => setFacebook(e.target.value)}
                placeholder="https://facebook.com/yourpage"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="social-zalo" className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" /> Zalo
              </Label>
              <Input
                id="social-zalo"
                value={zalo}
                onChange={(e) => setZalo(e.target.value)}
                placeholder="https://zalo.me/yourpage"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="social-youtube" className="flex items-center gap-2">
                <Youtube className="h-4 w-4" /> YouTube
              </Label>
              <Input
                id="social-youtube"
                value={youtube}
                onChange={(e) => setYoutube(e.target.value)}
                placeholder="https://youtube.com/@yourchannel"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="social-telegram" className="flex items-center gap-2">
                <Send className="h-4 w-4" /> Telegram
              </Label>
              <Input
                id="social-telegram"
                value={telegram}
                onChange={(e) => setTelegram(e.target.value)}
                placeholder="https://t.me/yourchannel"
              />
            </div>
          </div>
          <Button onClick={handleSaveSocial} disabled={updateSetting.isPending || createSetting.isPending}>
            {(updateSetting.isPending || createSetting.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Lưu Mạng Xã Hội
          </Button>
        </CardContent>
      </Card>

      {/* Footer Links */}
      <Card>
        <CardHeader>
          <CardTitle>Liên kết Footer</CardTitle>
          <CardDescription>Quản lý các cột liên kết trong footer</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {columns.map((column, columnIndex) => (
            <div key={columnIndex} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 mr-4">
                  <Label>Tiêu đề cột {columnIndex + 1}</Label>
                  <Input
                    value={column.title}
                    onChange={(e) => updateColumnTitle(columnIndex, e.target.value)}
                    placeholder="Tiêu đề cột"
                    className="mt-1"
                  />
                </div>
                {columns.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeColumn(columnIndex)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <Separator />

              <div className="space-y-3">
                <Label>Các liên kết</Label>
                {column.links.map((link, linkIndex) => (
                  <div key={linkIndex} className="flex items-center gap-2">
                    <Input
                      value={link.label}
                      onChange={(e) => updateLink(columnIndex, linkIndex, 'label', e.target.value)}
                      placeholder="Tên hiển thị"
                      className="flex-1"
                    />
                    <Input
                      value={link.url}
                      onChange={(e) => updateLink(columnIndex, linkIndex, 'url', e.target.value)}
                      placeholder="/path hoặc https://..."
                      className="flex-1"
                    />
                    {column.links.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeLink(columnIndex, linkIndex)}
                        className="text-destructive hover:text-destructive flex-shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addLink(columnIndex)}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm liên kết
                </Button>
              </div>
            </div>
          ))}

          <Button
            variant="outline"
            onClick={addColumn}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Thêm cột mới
          </Button>

          <Button 
            onClick={handleSaveLinks} 
            disabled={updateSetting.isPending || createSetting.isPending}
            className="w-full"
          >
            {(updateSetting.isPending || createSetting.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Lưu Liên Kết Footer
          </Button>
        </CardContent>
      </Card>

      {/* Copyright */}
      <Card>
        <CardHeader>
          <CardTitle>Bản quyền</CardTitle>
          <CardDescription>Dòng copyright hiển thị cuối footer</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="copyright">Nội dung copyright</Label>
            <Input
              id="copyright"
              value={copyrightText}
              onChange={(e) => setCopyrightText(e.target.value)}
              placeholder={`© ${new Date().getFullYear()} TênCôngTy. Đã đăng ký bản quyền.`}
            />
            <p className="text-xs text-muted-foreground">
              Để trống sẽ tự động hiển thị: © {new Date().getFullYear()} [Tên công ty]. Đã đăng ký bản quyền.
            </p>
          </div>
          <Button onClick={handleSaveCopyright} disabled={updateSetting.isPending || createSetting.isPending}>
            {(updateSetting.isPending || createSetting.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Lưu Copyright
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
