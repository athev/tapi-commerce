
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface ProductImageGalleryProps {
  images: string[];
  title: string;
}

const ProductImageGallery = ({ images, title }: ProductImageGalleryProps) => {
  const [currentImage, setCurrentImage] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const isMobile = useIsMobile();

  const productImages = images.length > 0 ? images : ["/placeholder.svg"];

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % productImages.length);
  };

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + productImages.length) % productImages.length);
  };

  return (
    <div className="space-y-3 lg:space-y-4">
      {/* Main Image */}
      <Card className="relative overflow-hidden bg-gray-50">
        <div className="aspect-square relative group">
          <img 
            src={productImages[currentImage]} 
            alt={title}
            className={`w-full h-full object-cover transition-transform duration-300 ${
              isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'
            }`}
            onClick={() => setIsZoomed(!isZoomed)}
          />
          
          {/* Zoom Icon - Hide on mobile */}
          {!isMobile && (
            <div className="absolute top-3 lg:top-4 right-3 lg:right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button size="sm" variant="secondary" className="bg-white/90 hover:bg-white h-8 w-8 p-0">
                <ZoomIn className="h-3 w-3 lg:h-4 lg:w-4" />
              </Button>
            </div>
          )}

          {/* Navigation Arrows */}
          {productImages.length > 1 && (
            <>
              <Button
                size="sm"
                variant="secondary"
                className="absolute left-2 lg:left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white h-8 w-8 p-0"
                onClick={prevImage}
              >
                <ChevronLeft className="h-3 w-3 lg:h-4 lg:w-4" />
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="absolute right-2 lg:right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white h-8 w-8 p-0"
                onClick={nextImage}
              >
                <ChevronRight className="h-3 w-3 lg:h-4 lg:w-4" />
              </Button>
            </>
          )}
        </div>
      </Card>

      {/* Thumbnail Gallery */}
      {productImages.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto">
          {productImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentImage(index)}
              className={`flex-shrink-0 w-12 h-12 lg:w-16 lg:h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                currentImage === index 
                  ? 'border-marketplace-primary' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <img 
                src={image} 
                alt={`${title} ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductImageGallery;
