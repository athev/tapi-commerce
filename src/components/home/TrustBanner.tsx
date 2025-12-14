import { useSiteSettings, SiteSetting } from "@/hooks/useSiteSettings";

const trustItems = [
  "Bảo hành trọn đời",
  "Thanh toán an toàn",
  "Hỗ trợ 24/7",
  "Giao tự động 3s",
];

const TrustBanner = () => {
  const { data } = useSiteSettings('branding');
  const brandingSetting = data as SiteSetting | undefined;
  const siteName = brandingSetting?.value?.siteName || "TAPI";

  const renderTrustItems = () => (
    <>
      {trustItems.map((item, index) => (
        <div key={index} className="flex items-center whitespace-nowrap">
          <span className="text-sm text-foreground">{item}</span>
          <span className="text-muted-foreground/50 mx-3">|</span>
        </div>
      ))}
    </>
  );

  return (
    <section className="bg-card border-b border-border/50 py-2">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3">
          {/* Fixed label */}
          <span className="flex-shrink-0 text-sm font-semibold text-primary whitespace-nowrap">
            {siteName} cam kết
          </span>
          
          {/* Scrolling container */}
          <div className="flex-1 overflow-hidden">
            <div className="flex animate-marquee">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center mr-3">
                  {renderTrustItems()}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustBanner;
