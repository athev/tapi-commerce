
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, ZoomIn, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";

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
    <div className="space-y-4">
      {/* Main Image */}
      <Card className="relative overflow-hidden bg-gray-50 border-2 border-gray-100">
        <div className="aspect-square relative group">
          <img 
            src={productImages[currentImage]} 
            alt={title}
            className={`w-full h-full object-cover transition-transform duration-300 ${
              isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'
            }`}
            onClick={() => setIsZoomed(!isZoomed)}
          />
          
          {/* Quality Badge */}
          <div className="absolute top-3 left-3">
            <Badge className="bg-green-500 text-white text-xs">
              HD Quality
            </Badge>
          </div>
          
          {/* Image Indicator */}
          {productImages.length > 1 && (
            <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-3 py-1 rounded-full">
              {currentImage + 1}/{productImages.length}
            </div>
          )}
          
          {/* Zoom Icon - Hide on mobile */}
          {!isMobile && (
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button size="sm" variant="secondary" className="bg-white/90 hover:bg-white h-8 w-8 p-0">
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
                className="absolute left-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white h-10 w-10 p-0 rounded-full shadow-lg"
                onClick={prevImage}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white h-10 w-10 p-0 rounded-full shadow-lg"
                onClick={nextImage}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </>
          )}

          {/* Preview Label */}
          <div className="absolute bottom-3 left-3">
            <Badge variant="outline" className="bg-white/90 text-gray-700 text-xs">
              <Eye className="h-3 w-3 mr-1" />
              Preview
            </Badge>
          </div>
        </div>
      </Card>

      {/* Thumbnail Gallery */}
      {productImages.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {productImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentImage(index)}
              className={`flex-shrink-0 w-16 h-16 lg:w-20 lg:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                currentImage === index 
                  ? 'border-marketplace-primary shadow-md' 
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

      {/* Image Features for Digital Products */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h4 className="font-medium text-blue-800 mb-2">Bạn sẽ nhận được:</h4>
        <div className="space-y-1 text-sm text-blue-700">
          <div className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
            <span>File gốc chất lượng cao</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
            <span>Hướng dẫn sử dụng chi tiết</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
            <span>Hỗ trợ kỹ thuật miễn phí</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductImageGallery;
