import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface Promotion {
  id: string;
  content: string;
  is_active: boolean;
}

interface ShopPromoBannerProps {
  sellerId: string;
}

const ShopPromoBanner = ({ sellerId }: ShopPromoBannerProps) => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPromotions = async () => {
      const { data, error } = await supabase
        .from('seller_promotions')
        .select('*')
        .eq('seller_id', sellerId)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (!error && data && data.length > 0) {
        setPromotions(data);
      }
      setIsLoading(false);
    };

    fetchPromotions();
  }, [sellerId]);

  // Auto-slide every 4 seconds
  useEffect(() => {
    if (promotions.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % promotions.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [promotions.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + promotions.length) % promotions.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % promotions.length);
  };

  if (isLoading || promotions.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border-b">
      <div className="relative px-4 py-3">
        {/* Promo Content */}
        <div className="flex items-center justify-center min-h-[2rem]">
          <p className="text-sm text-center text-foreground font-medium px-8">
            {promotions[currentIndex].content}
          </p>
        </div>

        {/* Navigation Arrows */}
        {promotions.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-background/80 hover:bg-background shadow-sm"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-background/80 hover:bg-background shadow-sm"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}

        {/* Dots Indicator */}
        {promotions.length > 1 && (
          <div className="flex justify-center gap-1 mt-2">
            {promotions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  "w-1.5 h-1.5 rounded-full transition-colors",
                  index === currentIndex ? "bg-primary" : "bg-primary/30"
                )}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopPromoBanner;
