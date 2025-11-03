import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const HERO_SLIDES = [
  {
    id: 1,
    title: "Flash Sale Cuối Tuần",
    subtitle: "Giảm đến 50% cho các khóa học hot",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=400&fit=crop",
    link: "/?category=Flash Sale"
  },
  {
    id: 2,
    title: "Ebook Best Seller",
    subtitle: "Hàng ngàn ebook chất lượng cao",
    image: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1200&h=400&fit=crop",
    link: "/?category=Ebook"
  },
  {
    id: 3,
    title: "Khóa Học Online",
    subtitle: "Học từ các chuyên gia hàng đầu",
    image: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=1200&h=400&fit=crop",
    link: "/?category=Khóa học"
  },
  {
    id: 4,
    title: "Template Chuyên Nghiệp",
    subtitle: "Thiết kế đẹp, dễ tùy chỉnh",
    image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1200&h=400&fit=crop",
    link: "/?category=Template"
  }
];

const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  return (
    <div className="relative w-full h-[300px] md:h-[400px] lg:h-[450px] overflow-hidden bg-muted">
      {/* Slides */}
      <div className="relative h-full">
        {HERO_SLIDES.map((slide, index) => (
          <a
            key={slide.id}
            href={slide.link}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="relative h-full">
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-center container mx-auto px-4">
                <h2 className="text-2xl md:text-4xl lg:text-6xl font-bold text-white mb-1 md:mb-2 lg:mb-4 drop-shadow-2xl">
                  {slide.title}
                </h2>
                <p className="text-sm md:text-lg lg:text-2xl text-white/90 max-w-2xl mb-3 md:mb-4 lg:mb-6 drop-shadow-lg line-clamp-2">
                  {slide.subtitle}
                </p>
                
                {/* CTA Buttons - Stack on mobile */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 md:gap-4">
                  <Button 
                    size="sm"
                    className="bg-white text-primary hover:bg-white/90 font-semibold px-4 md:px-8 shadow-xl h-9 md:h-11 text-xs md:text-sm"
                    asChild
                  >
                    <a href={slide.link}>
                      Khám phá ngay
                      <ChevronRight className="ml-1 md:ml-2 h-3 w-3 md:h-5 md:w-5" />
                    </a>
                  </Button>
                  
                  {/* Hide second button on small mobile */}
                  <Button 
                    size="sm"
                    variant="outline"
                    className="hidden sm:flex border-2 border-white text-white hover:bg-white/10 font-semibold px-4 md:px-8 backdrop-blur-sm h-9 md:h-11 text-xs md:text-sm"
                    asChild
                  >
                    <Link to="/">
                      Xem danh mục
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>

      {/* Navigation Arrows */}
      <Button
        variant="ghost"
        size="icon"
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background h-10 w-10 rounded-full"
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background h-10 w-10 rounded-full"
      >
        <ChevronRight className="h-6 w-6" />
      </Button>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {HERO_SLIDES.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentSlide
                ? "w-8 bg-white"
                : "w-2 bg-white/50 hover:bg-white/75"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;
