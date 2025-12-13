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

  return (
    <section className="bg-primary/5 border-y border-primary/10 py-2">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-2 md:gap-3 flex-wrap">
          <span className="text-xs font-semibold text-primary whitespace-nowrap">
            {siteName} cam kết:
          </span>
          {trustItems.map((item, index) => (
            <div key={index} className="flex items-center gap-2 whitespace-nowrap">
              <span className="text-xs text-foreground font-medium">{item}</span>
              {index < trustItems.length - 1 && (
                <span className="text-muted-foreground">|</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBanner;
