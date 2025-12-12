import { Shield, CreditCard, Headphones, Zap } from "lucide-react";
import { useSiteSettings, SiteSetting } from "@/hooks/useSiteSettings";

const trustItems = [
  { icon: Shield, text: "Bảo hành trọn đời" },
  { icon: CreditCard, text: "Thanh toán an toàn" },
  { icon: Headphones, text: "Hỗ trợ 24/7" },
  { icon: Zap, text: "Giao tự động 3s" },
];

const TrustBanner = () => {
  const { data } = useSiteSettings('branding');
  const brandingSetting = data as SiteSetting | undefined;
  const siteName = brandingSetting?.value?.siteName || "TAPI";

  const renderTrustItems = () => (
    <div className="flex items-center gap-4 md:gap-6">
      <span className="text-sm font-semibold text-primary whitespace-nowrap">
        {siteName} cam kết:
      </span>
      {trustItems.map((item, index) => (
        <div
          key={index}
          className="flex items-center gap-1.5 whitespace-nowrap"
        >
          <item.icon className="h-4 w-4 text-primary" />
          <span className="text-xs md:text-sm text-foreground font-medium">
            {item.text}
          </span>
          {index < trustItems.length - 1 && (
            <span className="text-border ml-2 md:ml-4">|</span>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <section className="bg-primary/5 border-y border-primary/10 py-3 overflow-hidden">
      <div className="flex animate-marquee">
        {renderTrustItems()}
        <div className="ml-8">{renderTrustItems()}</div>
        <div className="ml-8">{renderTrustItems()}</div>
      </div>
    </section>
  );
};

export default TrustBanner;
