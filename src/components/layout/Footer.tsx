import { Link } from "react-router-dom";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { Facebook, MessageCircle, Youtube, Send } from "lucide-react";

interface FooterLink {
  label: string;
  url?: string;
  path?: string;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

interface SocialLinks {
  facebook?: string;
  zalo?: string;
  youtube?: string;
  telegram?: string;
}

const Footer = () => {
  const { data: companyInfo } = useSiteSettings('company_info');
  const { data: contactInfo } = useSiteSettings('contact_info');
  const { data: footerLinks } = useSiteSettings('footer_links');
  const { data: socialLinks } = useSiteSettings('social_links');
  const { data: copyrightSetting } = useSiteSettings('copyright_text');

  // Extract values from settings with fallbacks
  const company = companyInfo && !Array.isArray(companyInfo) ? companyInfo.value : null;
  const contact = contactInfo && !Array.isArray(contactInfo) ? contactInfo.value : null;
  const links = footerLinks && !Array.isArray(footerLinks) ? footerLinks.value : null;
  const social: SocialLinks = socialLinks && !Array.isArray(socialLinks) ? socialLinks.value : {};
  const copyrightText = copyrightSetting && !Array.isArray(copyrightSetting) 
    ? copyrightSetting.value?.text 
    : null;

  // Default footer columns if not configured
  const defaultColumns: FooterColumn[] = [
    {
      title: "Liên kết",
      links: [
        { label: "Trang chủ", url: "/" },
        { label: "Sản phẩm", url: "/products" },
        { label: "Dịch vụ", url: "/services" },
        { label: "Đăng ký bán hàng", url: "/seller/register" },
      ]
    },
    {
      title: "Hỗ trợ",
      links: [
        { label: "Trung tâm hỗ trợ", url: "/help" },
        { label: "Câu hỏi thường gặp", url: "/faq" },
        { label: "Liên hệ", url: "/contact" },
      ]
    }
  ];

  const footerColumns: FooterColumn[] = links?.columns || defaultColumns;

  return (
    <footer className="bg-marketplace-secondary text-white">
      <div className="container py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-lg font-bold mb-4">
              {company?.name || 'DigitalMarket'}
            </h3>
            <p className="text-gray-300 text-sm">
              {company?.description || 'Sàn thương mại điện tử sản phẩm số phục vụ kiếm tiền online. Mọi giao dịch đều được bảo vệ.'}
            </p>
            
            {/* Social Links */}
            {(social.facebook || social.zalo || social.youtube || social.telegram) && (
              <div className="flex items-center gap-3 mt-4">
                {social.facebook && (
                  <a 
                    href={social.facebook} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    <Facebook className="h-5 w-5" />
                  </a>
                )}
                {social.zalo && (
                  <a 
                    href={social.zalo} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    <MessageCircle className="h-5 w-5" />
                  </a>
                )}
                {social.youtube && (
                  <a 
                    href={social.youtube} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    <Youtube className="h-5 w-5" />
                  </a>
                )}
                {social.telegram && (
                  <a 
                    href={social.telegram} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    <Send className="h-5 w-5" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Dynamic Footer Columns */}
          {footerColumns.map((column, index) => (
            <div key={index}>
              <h3 className="text-lg font-bold mb-4">{column.title}</h3>
              <ul className="space-y-2 text-sm">
                {column.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    {(() => {
                      const linkUrl = link.url || link.path || '/';
                      return linkUrl.startsWith('http') ? (
                        <a 
                          href={linkUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-gray-300 hover:text-white"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link to={linkUrl} className="text-gray-300 hover:text-white">
                          {link.label}
                        </Link>
                      );
                    })()}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold mb-4">Thông tin liên hệ</h3>
            <div className="space-y-2 text-sm">
              <p className="text-gray-300">
                Email: {contact?.email || 'support@digitalmarket.com'}
              </p>
              <p className="text-gray-300">
                Giờ làm việc: {contact?.hours || '08:00 - 22:00'}
              </p>
              {contact?.phone && (
                <p className="text-gray-300">
                  Hotline: {contact.phone}
                </p>
              )}
              {contact?.address && (
                <p className="text-gray-300">
                  Địa chỉ: {contact.address}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm text-gray-400">
          <p>
            {copyrightText || `© ${new Date().getFullYear()} DigitalMarket. Đã đăng ký bản quyền.`}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
