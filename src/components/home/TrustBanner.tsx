import { useSiteSettings, SiteSetting } from "@/hooks/useSiteSettings";

const trustItems = [
  "1 đổi 1",
  "Thanh toán an toàn",
  "Hỗ trợ 24/7",
  "Giao tự động 3s",
  "Bảo hành trọn đời",
];

const TrustBanner = () => {
  const { data } = useSiteSettings('branding');
  const brandingSetting = data as SiteSetting | undefined;
  const siteName = brandingSetting?.value?.siteName || "TAPI";

  const renderTrustItems = () => (
    <>
      {trustItems.map((item, index) => (
        <div key={index} className="flex items-center whitespace-nowrap">
          <span className="text-sm text-muted-foreground">{item}</span>
          <span className="text-border mx-4">|</span>
        </div>
      ))}
    </>
  );

  return (
    <section className="bg-card py-2.5 border-y border-border/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-4">
          {/* Fixed label */}
          <span className="flex-shrink-0 text-sm font-semibold text-primary whitespace-nowrap">
            {siteName} cam kết
          </span>
          
          {/* Scrolling container */}
          <div className="flex-1 overflow-hidden">
            <div className="flex animate-marquee">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center">
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
