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
        <div key={index} className="flex items-center gap-3 whitespace-nowrap">
          <span className="text-xs text-foreground font-medium">{item}</span>
          <span className="text-muted-foreground">|</span>
        </div>
      ))}
    </>
  );

  return (
    <section className="bg-primary/5 border-y border-primary/10 py-2">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3">
          {/* Fixed label */}
          <span className="flex-shrink-0 text-xs font-semibold text-primary whitespace-nowrap">
            {siteName} cam kết:
          </span>
          
          {/* Scrolling container */}
          <div className="flex-1 overflow-hidden">
            <div className="flex animate-marquee">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 mr-3">
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
