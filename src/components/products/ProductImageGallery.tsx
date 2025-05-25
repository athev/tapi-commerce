
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, ZoomIn, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";

interface ProductImageGalleryProps {
  images: string[];
  title: string;
}

const ProductImageGallery = ({ images, title }: ProductImageGalleryProps) => {
  const [currentImage, setCurrentImage] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const isMobile = useIsMobile();

  const productImages = images.length > 0 ? images : ["/placeholder.svg"];

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % productImages.length);
  };

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + productImages.length) % productImages.length);
  };

  return (
    <div className="space-y-4">
      {/* Main Image Display */}
      <Card className="relative overflow-hidden bg-white border border-gray-200 shadow-md">
        <div className="aspect-square relative group">
          {/* Product Badges */}
          <div className="absolute top-3 left-3 z-10 flex flex-col space-y-2">
            <Badge className="bg-red-600 text-white shadow-lg">
              -23% OFF
            </Badge>
            <Badge className="bg-green-600 text-white shadow-lg">
              Bán chạy
            </Badge>
          </div>

          {/* Favorite Button */}
          <div className="absolute top-3 right-3 z-10">
            <Button 
              size="sm" 
              variant="secondary" 
              className={`bg-white/90 hover:bg-white h-9 w-9 p-0 shadow-lg ${
                isFavorited ? "text-red-500" : "text-gray-600"
              }`}
              onClick={() => setIsFavorited(!isFavorited)}
            >
              <Heart className={`h-4 w-4 ${isFavorited ? "fill-current" : ""}`} />
            </Button>
          </div>
          
          <img 
            src={productImages[currentImage]} 
            alt={title}
            className={`w-full h-full object-cover transition-transform duration-300 ${
              isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'
            }`}
            onClick={() => setIsZoomed(!isZoomed)}
          />
          
          {/* Image Counter */}
          {productImages.length > 1 && (
            <div className="absolute bottom-3 right-3 bg-black/70 text-white text-sm px-3 py-1 rounded-full">
              {currentImage + 1}/{productImages.length}
            </div>
          )}
          
          {/* Zoom Icon - Hide on mobile */}
          {!isMobile && (
            <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button size="sm" variant="secondary" className="bg-white/90 hover:bg-white h-8 w-8 p-0 shadow-lg">
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Navigation Arrows */}
          {productImages.length > 1 && (
            <>
              <Button
                size="sm"
                variant="secondary"
                className="absolute left-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/95 hover:bg-white h-12 w-12 p-0 rounded-full shadow-lg border"
                onClick={prevImage}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/95 hover:bg-white h-12 w-12 p-0 rounded-full shadow-lg border"
                onClick={nextImage}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}
        </div>
      </Card>

      {/* Thumbnail Gallery */}
      {productImages.length > 1 && (
        <div className="flex space-x-3 overflow-x-auto pb-2">
          {productImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentImage(index)}
              className={`flex-shrink-0 w-20 h-20 lg:w-24 lg:h-24 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                currentImage === index 
                  ? 'border-blue-600 shadow-lg scale-105' 
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
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

      {/* Trust Signals */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-3 lg:p-4">
        <div className="space-y-2 text-sm">
          <div className="flex items-center text-green-800">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
            <span className="font-medium">Tải về ngay sau khi thanh toán</span>
          </div>
          <div className="flex items-center text-green-700">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
            <span>File đã được kiểm tra an toàn</span>
          </div>
          <div className="flex items-center text-green-700">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
            <span>Hoàn tiền 100% trong 7 ngày</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductImageGallery;
