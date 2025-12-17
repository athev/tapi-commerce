import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShopHeroBannerCarouselProps {
  shopBanner?: string | null;
  shopName: string;
  shopDescription?: string | null;
}

const ShopHeroBannerCarousel = ({ 
  shopBanner, 
  shopName,
  shopDescription 
}: ShopHeroBannerCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // For now, use shop banner + generated gradient banners
  // Later can extend to support multiple uploaded banners
  const banners = [
    {
      type: 'image' as const,
      image: shopBanner,
      title: shopName,
      subtitle: shopDescription || "Chất lượng - Uy tín - Giá tốt"
    },
    {
      type: 'gradient' as const,
      gradient: "from-primary/80 via-primary to-primary/90",
      title: "🎁 Ưu đãi đặc biệt",
      subtitle: "Giảm đến 50% cho khách hàng mới"
    },
    {
      type: 'gradient' as const,
      gradient: "from-orange-500 via-red-500 to-pink-500",
      title: "⚡ Flash Sale",
      subtitle: "Săn deal hot mỗi ngày"
    }
  ].filter(b => b.type === 'gradient' || b.image);

  // Auto-slide every 5 seconds
  useEffect(() => {
    if (banners.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [banners.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  if (banners.length === 0) return null;

  const currentBanner = banners[currentIndex];

  return (
    <div className="relative w-full overflow-hidden rounded-lg">
      {/* Banner Content */}
      <div 
        className={cn(
          "relative h-[160px] sm:h-[200px] md:h-[240px] w-full transition-all duration-500",
          currentBanner.type === 'gradient' && `bg-gradient-to-r ${currentBanner.gradient}`
        )}
        style={currentBanner.type === 'image' && currentBanner.image ? {
          backgroundImage: `url(${currentBanner.image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        } : undefined}
      >
        {/* Overlay for image banners */}
        {currentBanner.type === 'image' && (
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />
        )}
        
        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-8">
          <h2 className="text-white text-xl sm:text-2xl md:text-3xl font-bold drop-shadow-lg mb-2 line-clamp-2">
            {currentBanner.title}
          </h2>
          <p className="text-white/90 text-sm sm:text-base drop-shadow-md line-clamp-2 max-w-md">
            {currentBanner.subtitle}
          </p>
        </div>
      </div>

      {/* Navigation Arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/80 hover:bg-white shadow-md transition-colors"
          >
            <ChevronLeft className="h-4 w-4 text-foreground" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/80 hover:bg-white shadow-md transition-colors"
          >
            <ChevronRight className="h-4 w-4 text-foreground" />
          </button>
        </>
      )}

      {/* Dot Indicators */}
      {banners.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                index === currentIndex 
                  ? "bg-white w-6" 
                  : "bg-white/50 hover:bg-white/70"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ShopHeroBannerCarousel;
